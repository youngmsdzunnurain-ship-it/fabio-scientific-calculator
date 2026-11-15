# Fabio deployment notes

## Netlify
Connect the GitHub repository to a Netlify site. The checked-in `netlify.toml` sets `npm run build`, publishes `dist`, and rewrites client-side routes to `index.html`.

The Base44 app currently has the slug `young-math-flow` and ID `6a46c276fe4fb0c072b9ff4e`. Its published endpoint must be live before external clients can rely on the Base44 app URL. The repository currently supplies these public defaults in `src/lib/app-params.js`.

## PWA
The deployed site must use HTTPS. After the first successful visit, supported browsers can install Fabio from the browser's install prompt or menu. The service worker caches the static app shell only; it deliberately excludes API and authentication requests.

## Android
The GitHub Actions workflow runs calculator tests, lint, a Vite production build, and then creates a Capacitor Android debug APK. Download the `fabio-android-debug` artifact from a successful workflow run. A version tag such as `v1.1.0` also publishes the APK as a GitHub Release asset.

## Native signing
The automated build currently creates a debug APK for personal installation and testing. A Play Store release requires a separately signed release build and a protected signing key; do not commit keystore files or passwords to this repository.
