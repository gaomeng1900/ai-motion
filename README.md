# ai-motion

Minimal WebGL2 ESM library for an AI-style border+glow animation. No dependencies. Pure JS for modern browsers.

![Demo](/public/demo.gif)

## Usage

`npm i -S ai-motion`

### API

```ts
import { Motion } from 'ai-motion';

const motion = new Motion({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    styles: {
        position: 'fixed',
        inset: '0',
    }
});

// Mount where you like
document.body.appendChild(motion.element);

// start the animation
motion.start()

// pause the rendering
// motion.pause()

// autoResize to another element
// motion.autoResize(container)

// fade in animation
// motion.fadeIn()

// fade out animation
// motion.fadeOut()

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
