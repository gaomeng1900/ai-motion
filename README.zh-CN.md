# AI Motion

[![npm version](https://badge.fury.io/js/ai-motion.svg)](https://www.npmjs.com/package/ai-motion)
[![CI](https://github.com/gaomeng1900/ai-motion/workflows/CI/badge.svg)](https://github.com/gaomeng1900/ai-motion/actions)
[![npm downloads](https://img.shields.io/npm/dm/ai-motion.svg)](https://www.npmjs.com/package/ai-motion)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[English](README.md) | 中文**

基于 WebGL2 的 AI 风格发光边框动画。零依赖，仅支持现代浏览器。

🌈 **[在线演示](https://gaomeng1900.github.io/ai-motion/)**

![演示](public/demo.gif)

## 安装

```bash
npm install ai-motion
```

## 快速开始

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

## API 参考

### 构造函数

```ts
new Motion(options?: MotionOptions)
```

创建一个带有 WebGL2 canvas 元素的新 Motion 实例。

> 如果浏览器不支持 WebGL2 会抛出错误。

### 方法

#### `start(): void`

启动动画循环（限制为 30 fps）。可以安全地多次调用。

```ts
motion.start()
```

#### `pause(): void`

暂停动画循环。保留状态。

```ts
motion.pause()
```

#### `dispose(): void`

清理 WebGL 资源并移除 canvas。实例将不可用。

```ts
motion.dispose()
```

#### `resize(width: number, height: number, ratio?: number): void`

调整 canvas 大小并重建几何体。如果正在运行会立即更新图像。

```ts
motion.resize(800, 600)
motion.resize(800, 600, 2) // 使用自定义像素比
```

#### `autoResize(element: HTMLElement): void`

使用 ResizeObserver 自动调整大小以匹配目标元素。

```ts
const container = document.getElementById('container')
motion.autoResize(container)
```

#### `fadeIn(): Promise<void>`

带缩放效果的透明度 0→1 动画（300ms）。

```ts
await motion.fadeIn()
```

#### `fadeOut(): Promise<void>`

带缩放效果的透明度 1→0 动画（300ms）。

```ts
await motion.fadeOut()
```

### 属性

#### `element: HTMLElement`

canvas 元素。根据需要添加到 DOM 中。

```ts
document.body.appendChild(motion.element)
```

## 配置选项

```ts
interface MotionOptions {
	width?: number // Canvas 宽度（默认：600）
	height?: number // Canvas 高度（默认：600）
	ratio?: number // 设备像素比倍数（默认：devicePixelRatio）
	mode?: 'dark' | 'light' // 颜色优化（默认：'light'）
	colors?: [CSSRgbString, CSSRgbString, CSSRgbString, CSSRgbString] // 颜色列表（默认：见下文）
	borderWidth?: number // 边框厚度（默认：8）
	glowWidth?: number // 发光效果宽度（默认：200）
	borderRadius?: number // 圆角半径（默认：8）
	classNames?: string // Canvas 的 CSS 类名
	styles?: Partial<CSSStyleDeclaration> // Canvas 的 CSS 样式
}
```

### 模式详情

- **`light`**：高饱和度，在浅色背景上效果更好
- **`dark`**：清洁的发光效果，在深色背景上效果更好

根据你的背景颜色选择。如果不确定，请使用 light 模式。

### 颜色配置

`colors` 选项允许你自定义动画边框的渐变颜色。必须是一个包含恰好 4 个 RGB 颜色字符串的数组。

**默认颜色：**

```ts
[
	'rgb(57, 182, 255)', // 青色
	'rgb(189, 69, 251)', // 紫色
	'rgb(255, 87, 51)', // 橙色
	'rgb(255, 214, 0)' // 黄色
]
```

**自定义颜色示例：**

```ts
const motion = new Motion({
	colors: [
		'rgb(255, 0, 128)', // 粉色
		'rgb(128, 0, 255)', // 紫色
		'rgb(0, 128, 255)', // 蓝色
		'rgb(0, 255, 128)' // 绿色
	]
})
```

**重要说明：**

- 必须提供恰好 4 个颜色
- 颜色必须使用 RGB 格式：`'rgb(r, g, b)'`
- 值必须是 0-255 之间的整数
- 逗号后的空格是可选的：`'rgb(255, 0, 0)'` 和 `'rgb(255,0,0)'` 都有效

## 示例

### 全屏背景

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

### 响应式容器

```ts
// container.style.position: absolute/relative
const container = document.getElementById('hero')
const motion = new Motion()

container.appendChild(motion.element)
motion.autoResize(container)
motion.start()

// 淡入动画
await motion.fadeIn()
```

## 系统要求

- WebGL2 支持
- 现代浏览器

## 开发

```bash
npm install
npm start      # 开发服务器
npm run build  # 库构建
```

## 许可证

[MIT](./LICENSE)

## 致谢与社区

虽然 MIT 许可证允许在不要求署名的情况下自由使用，但我们鼓励并感谢那些承认原创作品的开发者。这有助于培养健康的开源生态系统并支持持续开发。

**如果 AI Motion 对你的项目有帮助，请考虑：**

- 在你的文档或 README 中提及此项目
- 在代码中保留署名注释
- 在适当的地方添加回到此仓库的链接
- 给仓库加星以表示支持

**回馈社区：**
我们欢迎社区的贡献！以下是你可以帮助的方式：

- 通过 [GitHub Issues](https://github.com/gaomeng1900/ai-motion/issues) 报告错误和建议功能
- 提交改进的拉取请求
- 分享你的使用案例和示例
- 帮助改进文档
- 传播项目

你的贡献，无论是代码、文档还是反馈，都有助于让 AI Motion 对每个人都更好。
