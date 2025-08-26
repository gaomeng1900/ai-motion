# Contributing

## Env

- node 20+
- vscode with recommended plugins (prettier/eslint/glsl)

## Setup

```bash
git clone https://github.com/gaomeng1900/ai-motion.git
cd ai-motion
npm install
npm start
```

**VSCode recommended** - install suggested extensions for GLSL syntax highlighting.

## Development

- `npm start` - dev server
- `npm run build` - build library
- Test in Chrome, Firefox, Safari
- WebGL2 required

## Pull Requests

1. Fork and create feature branch
2. Make changes, test in browsers
3. Use conventional commits (`feat:`, `fix:`, etc.)
4. Fill out PR template

## Issues

**Bug reports:** Include browser, WebGL2 status, minimal repro code
**Feature requests:** Describe use case and proposed API

## Code Style

Prettier + ESLint handle formatting. Write clean TypeScript with proper types.
