export function compileShader(
	gl: WebGL2RenderingContext,
	type: GLenum,
	source: string
): WebGLShader {
	const shader = gl.createShader(type)
	if (!shader) throw new Error('Failed to create shader')
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader) || 'Unknown shader error'
		gl.deleteShader(shader)
		throw new Error(info)
	}
	return shader
}

export function createProgram(
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string
): WebGLProgram {
	const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
	const program = gl.createProgram()
	if (!program) throw new Error('Failed to create program')
	gl.attachShader(program, vs)
	gl.attachShader(program, fs)
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program) || 'Unknown link error'
		gl.deleteProgram(program)
		gl.deleteShader(vs)
		gl.deleteShader(fs)
		throw new Error(info)
	}
	gl.deleteShader(vs)
	gl.deleteShader(fs)
	return program
}
