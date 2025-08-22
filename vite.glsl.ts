/**
 * Vite plugin to load GLSL files as string modules.
 * Supports .glsl file extensions.
 */
import type { Plugin } from 'vite'

export function glslLoaderPlugin(): Plugin {
	const extensions = ['.glsl']

	return {
		name: 'glsl-loader',

		load(id: string) {
			// Check if the file has a GLSL extension
			if (extensions.some((ext) => id.endsWith(ext))) {
				// Return null to let Vite handle the file reading
				return null
			}
		},

		transform(src: string, id: string) {
			// Transform GLSL files to ES modules
			if (extensions.some((ext) => id.endsWith(ext))) {
				// Minify the GLSL source by removing comments and unnecessary whitespace
				const minified = src
					.replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
					.replace(/\/\/.*$/gm, '') // Remove line comments
					.replace(/^\s+/gm, '') // Remove leading whitespace
					.replace(/\s+$/gm, '') // Remove trailing whitespace
					.replace(/\n\s*\n/g, '\n') // Remove empty lines
					.trim()

				return {
					code: `export default \`${minified}\`;`,
					map: null, // No source map
				}
			}
		},
	}
}
