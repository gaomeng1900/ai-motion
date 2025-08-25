import { computeBorderGeometry } from './gl/geometry'
import { createProgram } from './gl/program'
import fragmentShaderSource from './gl/shaders/fragment.glsl'
import vertexShaderSource from './gl/shaders/vertex.glsl'

// import { fragmentShaderSource, vertexShaderSource } from './gl/shaders/__legacy'

console.log(
	`%c🌈 AI Motion ${(window as any).__AI_MOTION_VERSION__ || ''} 🌈`,
	'background: linear-gradient(90deg, #39b6ff, #bd45fb, #ff5733, #ffd600); color: white; text-shadow: 0 0 5px rgba(0, 0, 0, 0.5); font-weight: bold; font-size: 1em; padding: 2px 12px; border-radius: 6px;'
)

export type MotionOptions = {
	/**
	 * The width of the motion element.
	 * @default 600
	 */
	width?: number
	/**
	 * The height of the motion element.
	 * @default 600
	 */
	height?: number
	/**
	 * Device pixel ratio multiplier; can be less than 1.
	 */
	ratio?: number
	/**
	 * Color mode. Upon what background color will the element be displayed.
	 * - dark: optimize for dark background. (clean and luminous glow. may be invisible on light backgrounds.)
	 * - light: optimize for light background. (high saturation glow. not elegant on dark backgrounds.)
	 * @default light
	 * @note It's not possible to make a style that works well on both light and dark backgrounds.
	 * @note If you do not know the background color, start with light.
	 */
	mode?: 'dark' | 'light'
	/**
	 * The width of the border.
	 * @default 8
	 */
	borderWidth?: number
	/**
	 * The width of the glow effect.
	 * @default 200
	 *
	 */
	glowWidth?: number
	/**
	 * The border radius.
	 * @default 8
	 */
	borderRadius?: number
	/**
	 * Custom class names for wrapper and canvas elements.
	 */
	classNames?: string
	/**
	 * Custom styles for wrapper and canvas elements.
	 */
	styles?: Partial<CSSStyleDeclaration>
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
	uBorderRadius: WebGLUniformLocation | null
	uColors: WebGLUniformLocation | null
}

/**
 * default light colors
 */
const COLORS = ['rgb(57, 182, 255)', 'rgb(189, 69, 251)', 'rgb(255, 87, 51)', 'rgb(255, 214, 0)']

/**
 * Parse CSS color string to normalized RGB vec3
 */
function parseColor(colorStr: string): [number, number, number] {
	const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
	if (!match) {
		throw new Error(`Invalid color format: ${colorStr}`)
	}
	const [, r, g, b] = match
	return [parseInt(r) / 255, parseInt(g) / 255, parseInt(b) / 255]
}

export class Motion {
	readonly element: HTMLElement

	private canvas: HTMLCanvasElement
	private options: Required<
		Pick<MotionOptions, 'ratio' | 'borderWidth' | 'glowWidth' | 'borderRadius'>
	> &
		Omit<MotionOptions, 'ratio' | 'borderWidth' | 'glowWidth' | 'borderRadius'>
	private running = false
	private disposed = false
	private startTime = 0
	private lastTime = 0
	private rafId: number | null = null
	private glr!: GLResources
	private observer?: ResizeObserver

	constructor(options: MotionOptions = {}) {
		this.options = {
			width: options.width ?? 600,
			height: options.height ?? 600,
			ratio: options.ratio ?? window.devicePixelRatio ?? 1,
			borderWidth: options.borderWidth ?? 8,
			glowWidth: options.glowWidth ?? 200,
			borderRadius: options.borderRadius ?? 8,
			mode: options.mode ?? 'light',
			...options,
		}

		this.canvas = document.createElement('canvas')
		if (this.options.classNames) {
			this.canvas.className = this.options.classNames
		}
		if (this.options.styles) {
			Object.assign(this.canvas.style, this.options.styles)
		}
		// Default sizing behavior: the wrapper defines layout; canvas is 100% size of wrapper
		this.canvas.style.display = 'block'
		this.canvas.style.transformOrigin = 'center'
		this.canvas.style.pointerEvents = 'none'
		this.element = this.canvas

		this.setupGL()
	}

	start(): void {
		if (this.disposed) throw new Error('Motion instance has been disposed.')
		if (this.running) return
		if (!this.glr) {
			console.error('WebGL resources are not initialized.')
			return
		}

		this.running = true
		this.startTime = performance.now()

		this.resize(this.options.width ?? 600, this.options.height ?? 600, this.options.ratio)

		// Initialize viewport and resolution to current canvas size.
		this.glr.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
		this.glr.gl.useProgram(this.glr.program)
		this.glr.gl.uniform2f(this.glr.uResolution, this.canvas.width, this.canvas.height)
		this.checkGLError(this.glr.gl, 'start: after initial setup')

		const loop = () => {
			if (!this.running || !this.glr) return
			this.rafId = requestAnimationFrame(loop)

			const now = performance.now()
			const delta = now - this.lastTime

			// This kind of animation will not benefit from high frame rates
			if (delta < 1000 / 32) return

			this.lastTime = now
			const t = (now - this.startTime) * 0.001
			this.render(t)
		}
		this.rafId = requestAnimationFrame(loop)
	}

	pause() {
		if (this.disposed) throw new Error('Motion instance has been disposed.')
		this.running = false
		if (this.rafId !== null) cancelAnimationFrame(this.rafId)
	}

	dispose(): void {
		if (this.disposed) throw new Error('Motion instance has been disposed.')
		this.disposed = true
		this.running = false
		if (this.rafId !== null) cancelAnimationFrame(this.rafId)

		const { gl, vao, positionBuffer, uvBuffer, program } = this.glr
		if (vao) gl.deleteVertexArray(vao)
		if (positionBuffer) gl.deleteBuffer(positionBuffer)
		if (uvBuffer) gl.deleteBuffer(uvBuffer)
		gl.deleteProgram(program)

		if (this.observer) this.observer.disconnect()

		this.canvas.remove()
	}

	resize(width: number, height: number, ratio?: number): void {
		if (this.disposed) throw new Error('Motion instance has been disposed.')

		this.options.width = width
		this.options.height = height
		if (ratio) this.options.ratio = ratio

		if (!this.running) return

		const { gl, program, vao, positionBuffer, uvBuffer, uResolution } = this.glr

		const dpr = ratio ?? this.options.ratio ?? window.devicePixelRatio ?? 1
		const desiredWidth = Math.max(1, Math.floor(width * dpr))
		const desiredHeight = Math.max(1, Math.floor(height * dpr))

		this.canvas.style.width = `${width}px`
		this.canvas.style.height = `${height}px`
		if (this.canvas.width !== desiredWidth || this.canvas.height !== desiredHeight) {
			this.canvas.width = desiredWidth
			this.canvas.height = desiredHeight
		}

		gl.viewport(0, 0, this.canvas.width, this.canvas.height)
		this.checkGLError(gl, 'resize: after viewport setup')

		// Rebuild geometry for current size
		const { positions, uvs } = computeBorderGeometry(
			this.canvas.width,
			this.canvas.height,
			this.options.borderWidth * dpr,
			this.options.glowWidth * dpr
		)

		gl.bindVertexArray(vao)

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
		const aPosition = gl.getAttribLocation(program, 'aPosition')
		gl.enableVertexAttribArray(aPosition)
		gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
		this.checkGLError(gl, 'resize: after position buffer update')

		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)
		const aUV = gl.getAttribLocation(program, 'aUV')
		gl.enableVertexAttribArray(aUV)
		gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0)
		this.checkGLError(gl, 'resize: after UV buffer update')

		gl.useProgram(program)
		gl.uniform2f(uResolution, this.canvas.width, this.canvas.height)
		gl.uniform1f(this.glr.uBorderWidth, this.options.borderWidth * dpr)
		gl.uniform1f(this.glr.uGlowWidth, this.options.glowWidth * dpr)
		gl.uniform1f(this.glr.uBorderRadius, this.options.borderRadius * dpr)
		this.checkGLError(gl, 'resize: after uniform updates')

		// Render a frame immediately after resize
		const now = performance.now()
		this.lastTime = now
		const t = (now - this.startTime) * 0.001
		this.render(t)
	}

	/**
	 * Automatically resizes the canvas to match the dimensions of the given element.
	 * @note using ResizeObserver
	 */
	autoResize(sourceElement: HTMLElement): void {
		if (this.observer) {
			this.observer.disconnect()
		}

		this.observer = new ResizeObserver(() => {
			const rect = sourceElement.getBoundingClientRect()
			this.resize(rect.width, rect.height)
		})

		this.observer.observe(sourceElement)
	}

	fadeIn(): Promise<void> {
		if (this.disposed) throw new Error('Motion instance has been disposed.')

		return new Promise<void>((resolve, reject) => {
			const animation = this.canvas.animate(
				[
					{ opacity: 0, transform: 'scale(1.2)' },
					{ opacity: 1, transform: 'scale(1)' },
				],
				{ duration: 300, easing: 'ease-out', fill: 'forwards' }
			)

			animation.onfinish = () => resolve()
			animation.oncancel = () => reject('canceled')
		})
	}

	fadeOut(): Promise<void> {
		if (this.disposed) throw new Error('Motion instance has been disposed.')

		return new Promise<void>((resolve, reject) => {
			const animation = this.canvas.animate(
				[
					{ opacity: 1, transform: 'scale(1)' },
					{ opacity: 0, transform: 'scale(1.2)' },
				],
				{ duration: 300, easing: 'ease-in', fill: 'forwards' }
			)

			animation.onfinish = () => resolve()
			animation.oncancel = () => reject('canceled')
		})
	}

	private checkGLError(gl: WebGL2RenderingContext, context: string): void {
		let error = gl.getError()
		if (error !== gl.NO_ERROR) {
			console.group(`🔴 WebGL Error in ${context}`)
			while (error !== gl.NO_ERROR) {
				const errorName = this.getGLErrorName(gl, error)
				console.error(`${errorName} (0x${error.toString(16)})`)
				error = gl.getError()
			}
			console.groupEnd()
		}
	}

	private getGLErrorName(gl: WebGL2RenderingContext, error: GLenum): string {
		switch (error) {
			case gl.INVALID_ENUM:
				return 'INVALID_ENUM'
			case gl.INVALID_VALUE:
				return 'INVALID_VALUE'
			case gl.INVALID_OPERATION:
				return 'INVALID_OPERATION'
			case gl.INVALID_FRAMEBUFFER_OPERATION:
				return 'INVALID_FRAMEBUFFER_OPERATION'
			case gl.OUT_OF_MEMORY:
				return 'OUT_OF_MEMORY'
			case gl.CONTEXT_LOST_WEBGL:
				return 'CONTEXT_LOST_WEBGL'
			default:
				return 'UNKNOWN_ERROR'
		}
	}

	private setupGL() {
		const gl = this.canvas.getContext('webgl2', { antialias: false, alpha: true })
		if (!gl) {
			throw new Error('WebGL2 is required but not available.')
		}

		const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)
		this.checkGLError(gl, 'setupGL: after createProgram')

		const vao = gl.createVertexArray()
		gl.bindVertexArray(vao)
		this.checkGLError(gl, 'setupGL: after VAO creation')

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
		this.checkGLError(gl, 'setupGL: after position buffer setup')

		const uvBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)

		const aUV = gl.getAttribLocation(program, 'aUV')
		gl.enableVertexAttribArray(aUV)
		gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0)
		this.checkGLError(gl, 'setupGL: after UV buffer setup')

		const uResolution = gl.getUniformLocation(program, 'uResolution')
		const uTime = gl.getUniformLocation(program, 'uTime')
		const uBorderWidth = gl.getUniformLocation(program, 'uBorderWidth')
		const uGlowWidth = gl.getUniformLocation(program, 'uGlowWidth')
		const uBorderRadius = gl.getUniformLocation(program, 'uBorderRadius')
		const uColors = gl.getUniformLocation(program, 'uColors')
		const uGlowExponent = gl.getUniformLocation(program, 'uGlowExponent')
		const uGlowFactor = gl.getUniformLocation(program, 'uGlowFactor')

		gl.useProgram(program)
		gl.uniform1f(uBorderWidth, this.options.borderWidth)
		gl.uniform1f(uGlowWidth, this.options.glowWidth)
		gl.uniform1f(uBorderRadius, this.options.borderRadius)
		if (this.options.mode === 'dark') {
			gl.uniform1f(uGlowExponent, 2.0)
			gl.uniform1f(uGlowFactor, 1.8)
		} else {
			gl.uniform1f(uGlowExponent, 1.0)
			gl.uniform1f(uGlowFactor, 1.0)
		}

		// Set color uniforms
		const colorVecs = COLORS.map(parseColor)
		for (let i = 0; i < colorVecs.length; i++) {
			gl.uniform3f(gl.getUniformLocation(program, `uColors[${i}]`), ...colorVecs[i])
		}
		this.checkGLError(gl, 'setupGL: after uniform setup')

		gl.bindVertexArray(null)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)

		this.glr = {
			gl,
			program,
			vao,
			positionBuffer,
			uvBuffer,
			uResolution,
			uTime,
			uBorderWidth,
			uGlowWidth,
			uBorderRadius,
			uColors,
		}
	}

	private render(t: number): void {
		if (!this.glr) return
		const { gl, program, vao, uTime } = this.glr

		gl.useProgram(program) // @todo optimize
		gl.bindVertexArray(vao) // @todo optimize
		gl.uniform1f(uTime, t)

		gl.disable(gl.DEPTH_TEST) // @todo optimize
		gl.disable(gl.CULL_FACE) // @todo optimize
		gl.disable(gl.BLEND) // @todo optimize
		gl.clearColor(0, 0, 0, 0) // @todo optimize
		gl.clear(gl.COLOR_BUFFER_BIT)

		// Draw 24 vertices (8 triangles)
		gl.drawArrays(gl.TRIANGLES, 0, 24)
		this.checkGLError(gl, 'render: after draw call')

		gl.bindVertexArray(null) // @todo optimize
	}
}
