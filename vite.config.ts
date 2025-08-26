import { defineConfig } from 'vite'

import { glslLoaderPlugin, replacePlugin } from './vite.plugins'

export default defineConfig({
	base: './',
	build: {
		outDir: 'build-demo',
		sourcemap: true,
		emptyOutDir: true,
	},
	server: {
		open: true,
	},
	publicDir: false,
	plugins: [
		glslLoaderPlugin(),
		replacePlugin({
			__AI_MOTION_VERSION__: JSON.stringify(process.env.npm_package_version),
		}),
	],
})
