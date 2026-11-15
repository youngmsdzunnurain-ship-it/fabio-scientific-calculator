# CI conditions

Feature branches and pull requests validate the web bundle without downloading the Android SDK. The Android SDK and Gradle steps run on `main` and version tags; tagged builds also attach the generated APK to a GitHub Release.
