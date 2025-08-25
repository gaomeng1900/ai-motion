# ai-motion

Minimal WebGL2 ESM library for an AI-style mask animation. No dependencies. Pure JS for modern browsers.

## Library

- Entry: `src/Motion.ts`
- WebGL2 only (no WebGL1/canvas fallback)

### API

```ts
import { Motion } from 'ai-motion';

const motion = new Motion();

// Mount where you like
container.appendChild(motion.element);
// Set size explicitly (width, height in CSS pixels; ratio defaults to devicePixelRatio)
motion.resize(container.clientWidth, container.clientHeight);

// Later, dispose
// motion.dispose();
```

## Demo

```bash
npm i
npm start
```

## Build

```bash
npm run build
npm run build:demo
```

## License

MIT License.
