# Build pipeline

GitHub Actions verifies the expression engine, runs ESLint, builds the Vite web bundle, then prepares and compiles the Android debug application. The first feature-branch run generates and commits the npm lockfile so later runs can use `npm ci` and resolve the same dependency graph.
