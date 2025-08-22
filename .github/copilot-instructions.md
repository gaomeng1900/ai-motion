# AI Motion - Copilot Instructions

## Project Overview

Minimal WebGL2 ESM library for AI-style mask animation. Single-class API with no runtime dependencies, targeting modern browsers only.

## Architecture & Key Constraints

- **WebGL2-only**: No WebGL1 fallback. Assumes modern browser support.
- **ESM-only**: No CommonJS/UMD builds. Library targets ES2019+.
- **Zero runtime deps**: Pure browser APIs only.
- **Non-mounting API**: Library provides DOM element but doesn't auto-append to document.

## Core Components

### `src/Motion.ts` - Main Class

- Single export class with imperative lifecycle API (start/dispose/resize pattern)
- Options validation and capping at construction time
- WebGL context creation deferred until start, not constructor

### `src/gl/` - WebGL Pipeline

- **`shaders.ts`**: Vertex/fragment source with GLSL template literals
- **`geometry.ts`**: Generates border-specific geometry (8 triangles, not fullscreen quad)
- **`createProgram.ts`**: Standard WebGL program compilation/linking

## Development Workflows

### Library Development

```bash
npm run build    	# ESM build lib+types
npm run build:demo 	# Build demo static files
```

### Demo/Testing

```bash
npm run dev          # Dev server using demo/ folder
npm run build:demo   # Static demo build → build-demo/
```

**Demo structure**: `index.html`

## WebGL Implementation Patterns

### Geometry Strategy

Uses border-optimized geometry generating triangles around canvas perimeter, not a fullscreen quad. This approach targets border/glow effects specifically.

### Shader Development

- Fragment shader handles animation logic using time-based uniforms
- UV coordinates span full canvas area (0..1)
- Current implementation shows test patterns; animation logic goes in fragment shader

### Resource Management

Proper WebGL cleanup is critical - dispose method handles resource cleanup and animation loop termination.

## Build System Details

- **Library config**: Builds single ESM entry point to `build/` directory
- **Demo config**: Separate build with html and live-reload development
- **Dual output strategy**: Library and demo builds are completely separate

## Code Style & Conventions

- TypeScript strict mode with explicit WebGL resource typing
- Error handling with descriptive context messages for WebGL operations
- Geometry computations in pixel space, converted to clip coordinates
- Constructor handles options with sensible defaults and validation

When modifying shaders, use the demo development server and monitor browser console for WebGL errors.
