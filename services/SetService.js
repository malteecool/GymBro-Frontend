import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { updateExerciseDate, updateExerciseMaxWeight } from './ExerciseService';

async function postExercise(exe_id, sets) {

    try {
        const documentData = {
            exh_date: Timestamp.fromDate(new Date()),
            exh_exe_id: exe_id
        };
        const docRef = await addDoc(collection(db, 'Exercise_history'), documentData);
        if (sets.length > 0) {
            sets.forEach(async (set,i) => {
                const setRef = await addDoc(collection(db, 'Exercise_history', docRef.id, 'sets'), {
                    set_reps: set.set_reps,
                    set_weight: set.set_weight,
                    set_order: i+1
                });
            });
            await updateExerciseDate(exe_id);
            await updateExerciseMaxWeight(exe_id, Math.max(...sets.map(o => o.set_weight)));
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