export const vertexShaderSource = /* glsl */ `#version 300 es
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
void main() {
  vUV = aUV;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

export const fragmentShaderSource = /* glsl */ `#version 300 es
precision lowp float;
in vec2 vUV;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uBorderWidth;
uniform float uGlowWidth;
uniform float uBorderRadius;
void main() {
  // UV gradient map
  vec2 uv = vUV;
  vec3 base = mix(vec3(0.1, 0.2, 0.9), vec3(0.9, 0.2, 0.1), uv.x);
  base = mix(base, vec3(0.1, 0.9, 0.2), uv.y);
  vec3 color = base;
  outColor = vec4(color, 1.0);
}
`
