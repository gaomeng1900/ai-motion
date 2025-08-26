import { defineConfig } from 'vite'

import { glslLoaderPlugin, replacePlugin } from './vite.plugins'

export default defineConfig({
	build: {
		outDir: 'build',
		lib: {
			entry: 'src/Motion.ts',
			name: 'Motion',
			formats: ['es'],
			fileName: () => 'motion.js',
		},
		sourcemap: false,
		minify: false,
		emptyOutDir: true,
	},
	publicDir: false,
	plugins: [
		glslLoaderPlugin(),
		replacePlugin({
			__AI_MOTION_VERSION__: JSON.stringify(process.env.npm_package_version),
		}),
	],
})
