import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: 'src/lib/Motion.ts',
			name: 'Motion',
			formats: ['es'],
			fileName: () => 'motion.js',
		},
		sourcemap: true,
		rollupOptions: {
			// No external deps
		},
		outDir: 'dist',
		emptyOutDir: true,
		target: 'es2019',
	},
})
