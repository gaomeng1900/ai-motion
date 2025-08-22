import { defineConfig } from 'vite'

import { glslLoaderPlugin } from './vite.glsl'

// Demo site config (blank/white page)
export default defineConfig({
	server: {
		open: true,
	},
	preview: {
		open: true,
	},
	build: {
		outDir: 'build-demo',
		emptyOutDir: true,
		sourcemap: true,
	},
	publicDir: false,
	define: {
		__AI_MOTION_VERSION__: JSON.stringify(process.env.npm_package_version),
	},
	plugins: [glslLoaderPlugin()],
})
