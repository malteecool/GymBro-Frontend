# Installation

## Requires node
https://nodejs.org/en

## npm install
After cloning the repository, cd to the newly created folder.
Inside the folder run ´npm install´ to download the needed node modules.

## Run the development build
The application is developed with Expo and uses native code. To run the development build use the command below: 

### npx expo run:android

# how to run: 
## 1. in /gymbro:
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

## 2. in /gymbro/android 
## 2. in /gymbro/android 
gradlew clean (?)
gradlew assembleRelease
APK will be available in Gymbro\android\app\build\outputs\apk\release


## 3. To run the development build:
clone
Cd gymbro
npx expo run:android (needed for native build)

APK will be available in Gymbro\android\app\build\outputs\apk\release


## 3. To run the development build:
clone
Cd gymbro
npx expo run:android (needed for native build)
