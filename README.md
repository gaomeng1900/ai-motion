# ai-motion

Minimal WebGL2 ESM library for an AI-style mask animation. No React/ThreeJS, no runtime deps. Pure JS for modern browsers.

## Library

- Entry: `src/lib/Motion.ts`
- ESM only
- WebGL2 only (no WebGL1 fallback)
- Exposes a single class `Motion` with `start()` and `dispose()` and an `element` wrapper `HTMLDivElement` you can mount anywhere. The class does NOT auto-append to `document.body`.

### API

```ts
import { Motion } from 'ai-motion';

const motion = new Motion({
  // sizing
  // width, height optional; if omitted, you must call resize() after mounting

  // border and glow (input to uniforms); drawing area = borderWidth + glowWidth
  borderWidth: 8,   // default 8; max capped to 20
  glowWidth: 100,   // default 100

  // optional CSS hooks
  classNames: { wrapper: 'ai-wrapper', canvas: 'ai-canvas' },
  styles: { wrapper: { position: 'relative' } },
});

// Mount where you like
container.appendChild(motion.element);
// Set size explicitly (width, height in CSS pixels; ratio defaults to devicePixelRatio)
motion.resize(container.clientWidth, container.clientHeight);
// Start rendering
motion.start();

// Later, dispose
motion.dispose();
```

Uniforms: `uResolution(vec2)`, `uTime(float)`, `uBorderWidth(float)`, `uGlowWidth(float)`.
UVs cover 0..1 across the full canvas. Fragment shader currently draws a UV test map; add your animation later.

## Demo

- Dev server: blank white page

```bash
npm i
npm run dev
```

Builds:

```bash
npm run build:lib
npm run build:demo
npm run preview:demo
```

MIT License.
