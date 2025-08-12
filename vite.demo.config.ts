import { defineConfig } from 'vite'

// Demo site config (blank/white page)
export default defineConfig({
	root: 'src/pages',
	server: {
		open: true,
	},
	preview: {
		open: true,
	},
	build: {
		outDir: '../../demo-dist',
		emptyOutDir: true,
		sourcemap: true,
	},
	publicDir: false,
})
