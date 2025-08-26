/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */
import type { Plugin } from 'vite'

/**
 * Vite plugin to load GLSL files as string modules.
 * Supports .glsl file extensions.
 */
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

/**
 * Vite plugin to replace constant values in code
 */
export function replacePlugin(replacements: Record<string, string>): Plugin {
	return {
		name: 'replace-constants',

		transform(src: string, id: string) {
			// Skip node_modules and non-JS/TS files
			if (id.includes('node_modules') || !/\.(js|ts|jsx|tsx)$/.test(id)) {
				return null
			}

			let code = src
			let hasReplacements = false

			// Apply all replacements
			for (const [key, value] of Object.entries(replacements)) {
				const regex = new RegExp(escapeRegExp(key), 'g')
				if (regex.test(code)) {
					code = code.replace(regex, value)
					hasReplacements = true
				}
			}

			// Only return transformed code if we made changes
			return hasReplacements ? { code, map: null } : null
		},
	}
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
