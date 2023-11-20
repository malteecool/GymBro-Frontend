import { REACT_APP_URL } from '@env';
import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, Timestamp, getDoc, doc, updateDoc } from "firebase/firestore";

async function updateWorkout(workout, timer) {
    console.log(workout);
    const docRef = updateDoc(doc(db, 'Workout', workout.id), {
        wor_completed_count: workout.wor_completed_count + 1,
        wor_estimate_time: timer,
        wor_last_done: Timestamp.fromDate(new Date())
    });
    return docRef;
}

async function getWorkoutExercises(workoutId) {
    console.log("workout id => " + workoutId);
    const exercises = query(collection(db, 'Workout', workoutId, 'workout_exercise'));
    const docSnap = await getDocs(exercises);
    var documentData = [];
    // iterate each exercise
    for (const exerciseDoc of docSnap.docs) {
        const exerciseId = await exerciseDoc.data().woe_exercise;
        const docRef = doc(db, "Exercise", exerciseId);
        var exercise = await getDoc(docRef);
        exercise = { id: exercise.id, ...exercise.data() };
        console.log(exercise);
        documentData.push(exercise);
    }
    return documentData;
}

const getFormattedTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor((time % 60));
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}


module.exports = {
    updateWorkout: updateWorkout,
    getWorkoutExercises: getWorkoutExercises,
    getFormattedTime: getFormattedTime
};
