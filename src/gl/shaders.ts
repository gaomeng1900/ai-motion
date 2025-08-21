/**
 * simplify shader code. remove unnecessary whitespace and all comments
 */
function simplify(shaderCode: string): string {
	return shaderCode
		.replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
		.replace(/\/\/.*$/gm, '') // remove line comments
		.replace(/\n+/g, '\n') // merge consecutive lines
		.trim()
}

/**
 * Vertex shader source code
 */
export const vertexShaderSource = simplify(/* glsl */ `#version 300 es

in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
void main() {
  vUV = aUV;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}

`)

/**
 * Fragment shader source code
 */
export const fragmentShaderSource = simplify(/* glsl */ `#version 300 es
precision lowp float;

in vec2 vUV;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uBorderWidth;
uniform float uGlowWidth;
uniform float uBorderRadius;
uniform vec3 uColors[4];

/**
 * Derivative-based Anti-aliasing
 */
float aaStep(float edge, float d) {
    // Calculate the width of the anti-aliasing transition
    // This is the distance the value changes over one pixel.
    float width = fwidth(d);
    return smoothstep(edge - width * 0.5, edge + width * 0.5, d);
}

/**
 * @name sdRoundedBox
 * @description Calculates the signed distance from a point to a rounded rectangle.
 * @param {vec2} p - The point coordinates.
 * @param {vec2} b - Half the size of the rectangle (half width and half height).
 * @param {float} r - The corner radius.
 * @returns {float} - Signed distance to the surface of the rounded rectangle.
 */
float sdRoundedBox( in vec2 p, in vec2 b, in float r )
{
	vec2 q = abs(p) - b + r;
	return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
	vec2 pos = vUV * uResolution;
	vec2 size = uResolution - vec2(uBorderWidth, uBorderWidth);

	// Calculate the signed distance from the rounded rectangle
	float dBox = sdRoundedBox(pos - uResolution * 0.5, size * 0.5, uBorderRadius);
	float isBox = aaStep(0.0, dBox);


	// UV gradient map
	vec3 test = vec3(vUV, 0.0);
	// test = vec3(isBorder, 0.0, 0.0);
	// test = vec3(isBox, 0.0, 0.0);
	test = vec3(mix(uColors[0], uColors[1], isBox));

	vec3 color = test;
	outColor = vec4(color, 1.0);
}

`)
