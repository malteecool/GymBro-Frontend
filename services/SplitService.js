import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, Timestamp, deleteDoc, doc, updateDoc, getDoc, addDoc } from "firebase/firestore";

async function getReferenceWeek(usr_id) {
    const collectionRef = collection(db, 'Split');
    const q = query(collectionRef, where("spl_usr_id", "==", usr_id));
    const docSnap = await getDocs(q);
    if (docSnap.docs[0].id) {
        const mainCollectionRef = collection(db, 'Split');
        const subCollectionRef = collection(mainCollectionRef, docSnap.docs[0].id, 'reference_week');
        const referenceDoc = await getDocs(subCollectionRef);
        return referenceDoc.docs[0].data();
    }
    return null;
}


async function addReferenceWeek(referenceWeek, usr_id) {
    
    const splitDocumentData = {
        spl_usr_id: usr_id
    };
    const docRef = await addDoc(collection(db, 'Split'), splitDocumentData);
    
    if (docRef) {
        let refDocumentData = {};
        referenceWeek.forEach((pair) => {
            refDocumentData[pair.day] = pair.workout;
        });

        const refDocRef = await addDoc(collection(db, 'Split', docRef.id, 'reference_week'), refDocumentData);
        console.log(refDocRef.id);
    }
}

module.exports = {
    getReferenceWeek: getReferenceWeek,
    addReferenceWeek: addReferenceWeek,
};