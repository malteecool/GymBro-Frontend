#how to run: 
1. in /gymbro:
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

2. in /gymbro/android 
gradlew clean (?)
gradlew assembleRelease


3. To run the development build:
clone
Cd gymbro
npx expo run:android (needed for native build)