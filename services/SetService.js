import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

async function postExercise(id, sets) {

    try {
        console.log(sets);
        const documentData = {
            exh_date: Timestamp.fromDate(new Date()),
            exh_exe_id: id
        };
        const docRef = await addDoc(collection(db, 'Exercise_history'), documentData);
        console.log("doc id => " + await docRef.id);
        if (sets.length > 0) {
            sets.forEach(async (set) => {
                console.log("adding set:" + set);
                const setRef = await addDoc(collection(db, 'Exercise_history', docRef.id, 'sets'), {
                    set_reps: set.set_reps,
                    set_weight: set.set_weight
                });
            });
        }
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}

module.exports = {
    postExercise: postExercise
}