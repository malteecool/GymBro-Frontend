import { ref, getBytes, getBlob, getStream } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { collection, addDoc, query, getDocs, where } from "firebase/firestore";

function getClientId() {
    if (Platform.OS === 'ios') {
        return process.env.REACT_APP_TOKEN;
    } else if (Platform.OS === 'android') {
        return process.env.REACT_APP_TOKEN;
    } else {
        console.log('Invalid platform - not handled');
    }
    return null;
}

async function userExist(id) {
    const collectionRef = collection(db, 'User');
    const q = query(collectionRef, where("usr_token", "==", id));
    const docSnap = await getDocs(q);

    //return first user found.
    const docData = await docSnap.docs[0].data();
    console.log('docData => ' + docData);
    return docData;
}

async function getUserData(auth) {
    console.log("access token => " + auth.accessToken);
    let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    const responseJson = await userInfoResponse.json();
    console.log('getUserdata:');
    console.log(responseJson);

    return responseJson;
};

async function addUser(userData) {
    console.log("Adding user");

    try {
        const dbRef = collection(db, 'User');
        const res = await addDoc(dbRef, {
            usr_name: userData.name,
            usr_token: userData.id
        });
    } catch (error) {
        console.log(error);
    }
    finally {
        return await userExist(userData.id);
    }

}

async function logout() {
    console.log('removing auth');
    await AsyncStorage.removeItem('auth');
};


module.exports = {
    getClientId: getClientId,
    userExist: userExist,
    getUserData: getUserData,
    addUser: addUser,
    logout: logout,
}