import { defineConfig } from 'vite'

// Demo site config (blank/white page)
export default defineConfig({
	root: 'demo',
	server: {
		open: true,
	},
	preview: {
		open: true,
	},
	build: {
		outDir: '../build-demo',
		emptyOutDir: true,
		sourcemap: true,
	},
	publicDir: false,
})
