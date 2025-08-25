import { defineConfig } from 'vite'

import { glslLoaderPlugin } from './vite.glsl'

export default defineConfig({
	build: {
		lib: {
			entry: 'src/Motion.ts',
			name: 'Motion',
			formats: ['es'],
			fileName: () => 'motion.js',
		},
		sourcemap: false,
		outDir: 'build',
		emptyOutDir: true,
		minify: false,
	},
	publicDir: false,
	define: {
		__AI_MOTION_VERSION__: JSON.stringify(process.env.npm_package_version),
	},
	plugins: [glslLoaderPlugin()],
})
