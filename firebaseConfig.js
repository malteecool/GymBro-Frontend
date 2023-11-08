// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC-OSX8UpUaTAHOANXXSMkhMVEsB0A522Y",
    authDomain: "gymbroapi.firebaseapp.com",
    projectId: "gymbroapi",
    storageBucket: "gymbroapi.appspot.com",
    messagingSenderId: "101860006838",
    appId: "1:101860006838:web:6ac517d4caf51c70c4bf17",
    measurementId: "G-31RNCLXTZW"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

const db = getFirestore(app);

export {db};


