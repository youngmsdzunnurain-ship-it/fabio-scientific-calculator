# Fabio Scientific Calculator

A bilingual scientific calculator built with React, Vite, Tailwind CSS and the Base44 backend.

## Features

- Standard and scientific calculation modes
- Degree and radian trigonometry
- Memory operations, calculation history and saved formulas
- Voice entry where browser speech recognition is available
- English and Arabic interface
- Light and dark appearance with twelve accent colour palettes
- Responsive desktop workspace and mobile navigation
- Installable Progressive Web App (PWA)
- Android application packaging with Capacitor

## Local development

Requirements: Node.js 22 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The Base44 app ID and app URL in `.env.example` are public configuration values. Keep access tokens and any private credentials out of source control.

## Verification

```bash
npm test
npm run lint
npm run build
```

## Web deployment on Netlify

The repository includes `netlify.toml`. Connect this repository to Netlify and use:

- Build command: `npm run build`
- Publish directory: `dist`

The SPA rewrite is configured for React Router. HTTPS is required for PWA installation.

## Install on phones

Open the deployed HTTPS website in a supported mobile browser and choose **Install app** or **Add to Home Screen**. The app manifest and service worker provide the installable shell. Account sign-in, saved history, formula sync and scan services still require a network connection.

## Android APK

Capacitor is configured in `capacitor.config.json`. To build locally with Android Studio and the Android SDK installed:

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

A GitHub Actions workflow also builds a debug APK and uploads it as a workflow artifact after tests, lint and the web build pass. Tagged pushes (`v*`) publish the APK as a GitHub Release asset.

## Backend and privacy

The calculator uses the existing Base44 app for authentication and cloud entities. Static hosting does not replace that backend. Keep the Base44 app available and ensure its access policy matches the intended audience before distributing the web or Android clients.
