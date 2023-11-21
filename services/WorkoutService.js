import { REACT_APP_URL } from '@env';
import { db } from "../firebaseConfig";
import emitter from "../components/customEventEmitter";
import { collection, query, getDocs, where, Timestamp, getDoc, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";


async function getWorkouts(usrToken) {
    const collectionRef = collection(db, 'Workout');
    const q = query(collectionRef, where("wor_usr_id", "==", usrToken));
    const docSnap = await getDocs(q);
    var workoutData = []
    // iterate each workout
    for (const doc of docSnap.docs) {
        var tempDoc = doc.data();
        var exerciseList = await getExerciseDocument(doc.id);
        tempDoc = { id: doc.id, wor_workout_exercises: exerciseList, ...tempDoc };
        workoutData.push(tempDoc);
    }

    workoutData.sort((a, b) => a.exe_date <= b.exe_date);
    return workoutData;
}

function getFirebaseTimeStamp(seconds, nanoseconds) {
    return new Timestamp(seconds, nanoseconds).toDate();
}

const getExerciseDocument = async (docId) => {
    const exercises = query(collection(db, 'Workout', docId, 'workout_exercise'));
    const docSnap = await getDocs(exercises);
    var documentData = [];
    // iterate each exercise
    for (const exerciseDoc of docSnap.docs) {
        const exerciseId = await exerciseDoc.data().woe_exercise;
        const docRef = doc(db, "Exercise", exerciseId);
        const exercise = await getDoc(docRef);
        documentData.push(exercise.data());
    }
    return documentData;
};

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

async function getDefaultWorkouts() {

    const collectionRef = collection(db, 'Default_workouts');
    const q = query(collectionRef);
    const docSnap = await getDocs(q);
    const docDataArray = [];
    await docSnap.forEach(async (doc) => {
        const docData = await doc.data();
        docDataArray.push(docData);
    });
    return docDataArray;
}

const getFormattedTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor((time % 60));
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

async function addWorkoutWithExercises(workoutName, selectedExercises) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wor_name: workoutName, wor_last_done: new Date(), wor_completed_count: 0, Wor_estimate_time: workoutTimeEstimate, wor_usr_id: userid, wor_workout_exercises: null })
    };
    try {
        console.log(REACT_APP_URL);
        const response = await fetch(REACT_APP_URL + '/Workouts', requestOptions);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const json = await response.json();
        console.log(json.id);
        const workoutId = json.id;
        console.log(selectedExercises)
        for (var i = 0; i < selectedExercises.length; i++) {
            // currently defaulting to 0 so cannot be added due to db constraint.
            console.log("adding exercise " + selectedExercises[i]);
            const responseJson = await postWorkoutExercise(selectedExercises[i], workoutId);
            console.log(responseJson);
        }
        emitter.emit('workoutEvent', 0);
        navigation.goBack();
    } catch (error) {
        console.log(`Error fetching data: ${error.message}`);
    }
}

async function addWorkout(name, usr_token) {
    try {
        const documentData = {
            wor_completed_count: 0,
            wor_estimate_time: 0,
            wor_last_done: Timestamp.fromDate(new Date()),
            wor_name: name,
            wor_usr_id: usr_token
        };
        const docRef = await addDoc(collection(db, "Workout"), documentData);
    }
    catch (error) {
        console.log(error);
    }
}

async function removeWorkout(workoutId) {
    const docRef = await deleteDoc(doc(db, "Workout", workoutId));
}


module.exports = {
    updateWorkout: updateWorkout,
    getWorkoutExercises: getWorkoutExercises,
    getFormattedTime: getFormattedTime,
    addWorkout: addWorkout,
    addWorkoutWithExercises: addWorkoutWithExercises,
    removeWorkout: removeWorkout,
    getWorkouts: getWorkouts,
    getFirebaseTimeStamp: getFirebaseTimeStamp,
    getDefaultWorkouts: getDefaultWorkouts
};
