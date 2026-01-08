# AI Motion

[![npm version](https://badge.fury.io/js/ai-motion.svg)](https://www.npmjs.com/package/ai-motion)
[![CI](https://github.com/gaomeng1900/ai-motion/workflows/CI/badge.svg)](https://github.com/gaomeng1900/ai-motion/actions)
[![npm downloads](https://img.shields.io/npm/dm/ai-motion.svg)](https://www.npmjs.com/package/ai-motion)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English | [中文](README.zh-CN.md)**

WebGL2 animated border with AI-style glow effects. Zero dependencies, modern browsers only.

🌈 **[Live Demo](https://gaomeng1900.github.io/ai-motion/)**

![Demo](public/demo.gif)

## Install

```bash
npm install ai-motion
```

## Quick Start

```ts
import { Motion } from 'ai-motion'

const motion = new Motion({
	width: 400,
	height: 300,
	mode: 'light'
})

document.body.appendChild(motion.element)
motion.start()
```

## API Reference

### Constructor

```ts
new Motion(options?: MotionOptions)
```

Creates a new Motion instance with WebGL2 canvas element.

> Throw error if the browser does not support WebGL2.

### Methods

#### `start(): void`

Starts the animation loop (cap to 30 fps). Safe to call multiple times.

```ts
motion.start()
```

#### `pause(): void`

Pauses the animation loop. Preserves state.

```ts
motion.pause()
```

#### `dispose(): void`

Cleans up WebGL resources and removes canvas. Instance becomes unusable.

```ts
motion.dispose()
```

#### `resize(width: number, height: number, ratio?: number): void`

Resizes canvas and rebuilds geometry. Updates image immediately if running.

```ts
motion.resize(800, 600)
motion.resize(800, 600, 2) // with custom pixel ratio
```

#### `autoResize(element: HTMLElement): void`

Auto-resizes to match target element using ResizeObserver.

```ts
const container = document.getElementById('container')
motion.autoResize(container)
```

#### `fadeIn(): Promise<void>`

Animates opacity 0→1 with scale effect (300ms).

```ts
await motion.fadeIn()
```

#### `fadeOut(): Promise<void>`

Animates opacity 1→0 with scale effect (300ms).

```ts
await motion.fadeOut()
```

### Properties

#### `element: HTMLElement`

The canvas element. Append to DOM where needed.

```ts
document.body.appendChild(motion.element)
```

## Options

```ts
interface MotionOptions {
	width?: number // Canvas width (default: 600)
	height?: number // Canvas height (default: 600)
	ratio?: number // Device pixel ratio multiplier (default: devicePixelRatio)
	mode?: 'dark' | 'light' // Color optimization (default: 'light')
	colors?: [CSSRgbString, CSSRgbString, CSSRgbString, CSSRgbString] // Color list (default: see below)
	borderWidth?: number // Border thickness (default: 8)
	glowWidth?: number // Glow effect width (default: 200)
	borderRadius?: number // Corner radius (default: 8)
	classNames?: string // CSS classes for canvas
	styles?: Partial<CSSStyleDeclaration> // CSS styles for canvas
}
```

### Mode Details

- **`light`**: High saturation, works better on light backgrounds
- **`dark`**: Clean luminous glow, works better on dark backgrounds

Choose based on your background color. Use light mode if you cannot decide.

### Colors

The `colors` option allows you to customize the gradient colors of the animated border. It must be an array of exactly 4 RGB color strings.

**Default colors:**

```ts
[
	'rgb(57, 182, 255)', // Cyan
	'rgb(189, 69, 251)', // Purple
	'rgb(255, 87, 51)', // Orange
	'rgb(255, 214, 0)' // Yellow
]
```

**Custom colors example:**

```ts
const motion = new Motion({
	colors: [
		'rgb(255, 0, 128)', // Pink
		'rgb(128, 0, 255)', // Purple
		'rgb(0, 128, 255)', // Blue
		'rgb(0, 255, 128)' // Green
	]
})
```

**Important notes:**

- Must provide exactly 4 colors
- Colors must be in RGB format: `'rgb(r, g, b)'`
- Values must be integers between 0-255
- Spaces after commas are optional: both `'rgb(255, 0, 0)'` and `'rgb(255,0,0)'` are valid

## Examples

### Fullscreen Background

```ts
const motion = new Motion({
	width: document.documentElement.clientWidth,
	height: document.documentElement.clientHeight,
	mode: 'dark',
	styles: {
		position: 'fixed',
		inset: '0'
	}
})

document.body.appendChild(motion.element)
motion.autoResize(document.body)
motion.start()
```

### Responsive Container

```ts
// container.style.position: absolute/relative
const container = document.getElementById('hero')
const motion = new Motion()

container.appendChild(motion.element)
motion.autoResize(container)
motion.start()

// Fade in animation
await motion.fadeIn()
```

## Requirements

- WebGL2 support
- Modern browsers

## Development

```bash
npm install
npm start      # dev server
npm run build  # library build
```

## License

[MIT](./LICENSE)

## Attribution & Community

While the MIT license allows free use without attribution requirements, we encourage and appreciate developers who acknowledge the original work. This helps foster a healthy open source ecosystem and supports continued development.

**If AI Motion helps your project, please consider:**

- Mentioning this project in your documentation or README
- Keeping attribution comments in your code
- Adding a link back to this repository when appropriate
- Starring the repository to show support

**Contributing Back to the Community:**
We welcome contributions from the community! Here are ways you can help:

- Report bugs and suggest features through [GitHub Issues](https://github.com/gaomeng1900/ai-motion/issues)
- Submit pull requests for improvements
- Share your use cases and examples
- Help improve documentation
- Spread the word about the project

Your contributions, whether code, documentation, or feedback, help make AI Motion better for everyone.
