#how to run: 
1. in /gymbro:
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

2. in /gymbro/android 
gradlew clean (?)
gradlew assembleRelease
APK will be available in Gymbro\android\app\build\outputs\apk\release


3. To run the development build:
clone
Cd gymbro
npx expo run:android (needed for native build)




# Color Theme:
## dark: #121111
## less dark: #1c1a1a
## Yellow: #CDCD55
## Green: #0C7C59

