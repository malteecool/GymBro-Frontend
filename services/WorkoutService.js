import { REACT_APP_URL } from '@env';
import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, Timestamp, getDoc, doc } from "firebase/firestore";

async function postWorkoutExercise(exerciseId, workoutId) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    };
    const response = await fetch(`${REACT_APP_URL}/Workouts/${workoutId}/addexercise?exerciseId=${exerciseId}`, requestOptions);
    console.log(REACT_APP_URL);
    console.log(response.status);
    const json = await response.json();
    return json;
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


module.exports = {
    postWorkoutExercise: postWorkoutExercise,
    getWorkoutExercises: getWorkoutExercises
};
