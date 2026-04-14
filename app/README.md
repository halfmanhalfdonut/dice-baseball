# Dice Baseball — App scaffold

This folder contains a Vite + TypeScript + Lit scaffold configured for PWA support via `vite-plugin-pwa`.

How to run (from `app/`):

```bash
# install deps
npm install

# dev server
npm run dev

# build
npm run build

# preview production build
npm run preview
```

Notes:
- The scaffold intentionally does not include the GameEngine implementation. We'll migrate game logic when you're ready.
- Add icons under `app/public/icons/` or update paths in `vite.config.ts` and `manifest.webmanifest`.
