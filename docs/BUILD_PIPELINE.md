# Build pipeline

GitHub Actions runs the calculator regression suite, ESLint, a Vite production build, and then prepares and compiles the Android debug application. Dependency installation currently uses the package ranges in `package.json`; a committed npm lockfile can be added after the resolved dependency graph is reviewed.
