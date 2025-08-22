import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: 'src/Motion.ts',
			name: 'Motion',
			formats: ['es'],
			fileName: () => 'motion.js',
		},
		sourcemap: true,
		outDir: 'build',
		emptyOutDir: true,
		target: 'es2019',
	},
	define: {
		__AI_MOTION_VERSION__: JSON.stringify(process.env.npm_package_version),
	},
})
