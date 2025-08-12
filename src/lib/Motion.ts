import { computeBorderGeometry } from './gl/border'
import { createProgram } from './gl/createProgram'
import { fragmentShaderSource, vertexShaderSource } from './gl/shaders'

export type MotionOptions = {
	width?: number // If omitted, uses element client size
	height?: number // If omitted, uses element client size
	ratio?: number // DPR multiplier; can be < 1
	borderWidth?: number // default 8
	glowWidth?: number // default 100
	classNames?: { wrapper?: string; canvas?: string }
	styles?: {
		wrapper?: Partial<CSSStyleDeclaration>
		canvas?: Partial<CSSStyleDeclaration>
	}
}

type GLResources = {
	gl: WebGL2RenderingContext
	program: WebGLProgram
	vao: WebGLVertexArrayObject | null
	positionBuffer: WebGLBuffer | null
	uvBuffer: WebGLBuffer | null
	uResolution: WebGLUniformLocation | null
	uTime: WebGLUniformLocation | null
	uBorderWidth: WebGLUniformLocation | null
	uGlowWidth: WebGLUniformLocation | null
}

export class Motion {
	public readonly element: HTMLDivElement

	private canvas: HTMLCanvasElement
	private options: Required<Pick<MotionOptions, 'ratio' | 'borderWidth' | 'glowWidth'>> &
		Omit<MotionOptions, 'ratio' | 'borderWidth' | 'glowWidth'>
	private running = false
	private startTime = 0
	private rafId: number | null = null
	private glr?: GLResources

	constructor(options: MotionOptions = {}) {
		this.options = {
			ratio: options.ratio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1),
			borderWidth: options.borderWidth ?? 8,
			glowWidth: options.glowWidth ?? 100,
			...options,
		}

		// Cap borderWidth to max 20
		if (this.options.borderWidth > 20) {
			this.options.borderWidth = 20
		}

		this.element = document.createElement('div')
		if (this.options.classNames?.wrapper) {
			this.element.className = this.options.classNames.wrapper
		}
		if (this.options.styles?.wrapper) {
			Object.assign(this.element.style, this.options.styles.wrapper)
		}

		this.canvas = document.createElement('canvas')
		if (this.options.classNames?.canvas) {
			this.canvas.className = this.options.classNames.canvas
		}
		if (this.options.styles?.canvas) {
			Object.assign(this.canvas.style, this.options.styles.canvas)
		}
		// Default sizing behavior: the wrapper defines layout; canvas is 100% size of wrapper
		this.canvas.style.display = 'block'
		this.canvas.style.width = '100%'
		this.canvas.style.height = '100%'
		this.element.appendChild(this.canvas)
	}

	public start(): void {
		if (this.running) return
		const gl = this.canvas.getContext('webgl2', { antialias: false })
		if (!gl) {
			throw new Error('WebGL2 is required but not available.')
		}

		this.glr = this.setupGL(gl)
		this.running = true
		this.startTime = performance.now()

		// Initialize viewport and resolution to current canvas size.
		gl.viewport(0, 0, this.canvas.width, this.canvas.height)
		gl.useProgram(this.glr.program)
		gl.uniform2f(this.glr.uResolution, this.canvas.width, this.canvas.height)

		const loop = () => {
			if (!this.running || !this.glr) return
			const now = performance.now()
			const t = (now - this.startTime) * 0.001
			this.render(t)
			this.rafId = requestAnimationFrame(loop)
		}
		this.rafId = requestAnimationFrame(loop)
	}

	public dispose(): void {
		this.running = false
		if (this.rafId !== null) cancelAnimationFrame(this.rafId)
		if (this.glr) {
			const { gl, vao, positionBuffer, uvBuffer, program } = this.glr
			if (vao) gl.deleteVertexArray(vao)
			if (positionBuffer) gl.deleteBuffer(positionBuffer)
			if (uvBuffer) gl.deleteBuffer(uvBuffer)
			gl.deleteProgram(program)
			this.glr = undefined
		}
	}

	private setupGL(gl: WebGL2RenderingContext): GLResources {
		const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

		const vao = gl.createVertexArray()
		gl.bindVertexArray(vao)

		// Build geometry: border-only with four rectangles (8 triangles)
		const pw = this.canvas.width || 2
		const ph = this.canvas.height || 2
		const { positions, uvs } = computeBorderGeometry(
			pw,
			ph,
			this.options.borderWidth,
			this.options.glowWidth
		)

		const positionBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

		const aPosition = gl.getAttribLocation(program, 'aPosition')
		gl.enableVertexAttribArray(aPosition)
		gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

		const uvBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)

		const aUV = gl.getAttribLocation(program, 'aUV')
		gl.enableVertexAttribArray(aUV)
		gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0)

		const uResolution = gl.getUniformLocation(program, 'uResolution')
		const uTime = gl.getUniformLocation(program, 'uTime')
		const uBorderWidth = gl.getUniformLocation(program, 'uBorderWidth')
		const uGlowWidth = gl.getUniformLocation(program, 'uGlowWidth')

		gl.useProgram(program)
		gl.uniform1f(uBorderWidth, this.options.borderWidth)
		gl.uniform1f(uGlowWidth, this.options.glowWidth)

		gl.bindVertexArray(null)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)

		return {
			gl,
			program,
			vao,
			positionBuffer,
			uvBuffer,
			uResolution,
			uTime,
			uBorderWidth,
			uGlowWidth,
		}
	}

	public resize(width: number, height: number, ratio?: number): void {
		if (!this.glr) return
		const { gl, program, vao, positionBuffer, uvBuffer, uResolution } = this.glr

		const dpr = ratio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
		const desiredWidth = Math.max(1, Math.floor(width * dpr))
		const desiredHeight = Math.max(1, Math.floor(height * dpr))

		if (this.canvas.width !== desiredWidth || this.canvas.height !== desiredHeight) {
			this.canvas.width = desiredWidth
			this.canvas.height = desiredHeight
		}

		gl.viewport(0, 0, this.canvas.width, this.canvas.height)

		// Rebuild geometry for current size
		const { positions, uvs } = computeBorderGeometry(
			this.canvas.width,
			this.canvas.height,
			this.options.borderWidth,
			this.options.glowWidth
		)

		gl.bindVertexArray(vao)

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
		const aPosition = gl.getAttribLocation(program, 'aPosition')
		gl.enableVertexAttribArray(aPosition)
		gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)
		const aUV = gl.getAttribLocation(program, 'aUV')
		gl.enableVertexAttribArray(aUV)
		gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0)

		gl.useProgram(program)
		gl.uniform2f(uResolution, this.canvas.width, this.canvas.height)
		gl.uniform1f(this.glr.uBorderWidth, this.options.borderWidth)
		gl.uniform1f(this.glr.uGlowWidth, this.options.glowWidth)
	}

	private render(t: number): void {
		if (!this.glr) return
		const { gl, program, vao, uTime } = this.glr

		gl.useProgram(program)
		gl.bindVertexArray(vao)
		gl.uniform1f(uTime, t)

		gl.disable(gl.DEPTH_TEST)
		gl.disable(gl.CULL_FACE)
		gl.disable(gl.BLEND)
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)

		// Draw 24 vertices (8 triangles)
		gl.drawArrays(gl.TRIANGLES, 0, 24)

		gl.bindVertexArray(null)
	}
}
