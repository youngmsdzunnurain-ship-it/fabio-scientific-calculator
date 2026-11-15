# Android release process

Pull requests and feature-branch pushes run the fast web verification gates. The Android SDK and Gradle packaging steps run only on the protected main branch, version tags, or an explicit workflow dispatch on main. This keeps review feedback fast while still producing APK artifacts for the release branch.
