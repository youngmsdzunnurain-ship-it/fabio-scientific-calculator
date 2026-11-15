# Production import resolution

Root-level application components are imported relative to `src/App.jsx`; shared UI and layout components use the `@/components` alias. This keeps Vite's production resolver aligned with the actual source tree.
