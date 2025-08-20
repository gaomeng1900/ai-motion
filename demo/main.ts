import { Motion } from '../src/Motion.js'

// Minimal demo with auto-resize for the container
const app = document.getElementById('app')
if (!app) {
	throw new Error('#app not found')
}

const motion = new Motion({
	styles: {
		wrapper: { width: '100%', height: '100%' },
	},
})

app.appendChild(motion.element)

const update = () => {
	motion.resize(app.clientWidth, app.clientHeight)
}

// Observe size changes of the container
const ro = new ResizeObserver(() => update())
ro.observe(app)

// Also update on window resizes (covers DPR changes in many browsers)
window.addEventListener('resize', update)

// Initial sizing, then start rendering
update()
motion.start()
