import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { updateExerciseDate, updateExerciseMaxWeight } from './ExerciseService.Service';

async function postExercise(exercise, sets) {

    try {
        const documentData = {
            exh_date: Timestamp.fromDate(new Date()),
            exh_exe_id: exercise.id,
            exh_usr_id: exercise.exe_usr_id
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
            await updateExerciseDate(exercise.id);
            await updateExerciseMaxWeight(exercise.id, Math.max(...sets.map(o => o.set_weight)));
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