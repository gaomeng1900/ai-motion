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
		rollupOptions: {
			// No external deps
		},
		outDir: 'build',
		emptyOutDir: true,
		target: 'es2019',
	},
})
