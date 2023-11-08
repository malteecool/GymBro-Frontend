import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, Timestamp, deleteDoc, doc } from "firebase/firestore";


async function getExercises(usr_token) {
    console.log("fetching exercises");
    var documentData = [];
    try {
        console.log("user => " + usr_token);
        const collectionRef = collection(db, 'Exercise');
        const q = query(collectionRef, where("exe_usr_id", "==", usr_token));
        const docSnap = await getDocs(q);
        // would need a remap to create database like objects with id received from doc.id
        for (const doc of docSnap.docs) {
            var exerciseDoc = { "id": doc.id, ...doc.data() };
            documentData.push(exerciseDoc);
        }
    }
    catch (error) {
        console.error(error)
    }
    return documentData;
};

async function getSetDocument(docId) {
    const sets = query(collection(db, 'Exercise_history', docId, 'sets'));
    const docSnap = await getDocs(sets);
    var documentData = [];
    docSnap.forEach(async (doc) => {
        documentData.push(doc.data());
    });
    return { "exh_sets": documentData };
};

async function getHistory(exerciseId) {
    var documentData = [];
    try {
        const collectionRef = collection(db, 'Exercise_history');
        const q = query(collectionRef, where("exh_exe_id", "==", exerciseId));
        const docSnap = await getDocs(q);
        if (docSnap.size > 0) {
            for (const doc of docSnap.docs) {
                var tempDoc = await getSetDocument(doc.id);
                tempDoc = { exh_date: doc.data().exh_date, ...tempDoc };
                documentData.push(tempDoc);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    return documentData;
};

function getFirebaseTimeStamp(seconds, nanoseconds) {
    return new Timestamp(seconds, nanoseconds).toDate();
}

async function removeExercise(exe_id, usr_id) {
    try {
        console.log("delete exercise with id: " + exe_id);
        const docRef = await deleteDoc(doc(db, "Exercise", exe_id));

        await removeWorkoutExercise(null, exe_id, usr_id);

    }
    catch (error) {
        console.error(error)
    }
}

async function removeWorkoutExercise(workout_id, exe_id, usr_id) {
    //scrape the workouts in order to remove the attached exercise.
    if (usr_id !== null) {
        const collectionRef = collection(db, 'Workout');
        const q = query(collectionRef, where("wor_usr_id", "==", usr_id));
        const docSnap = await getDocs(q);

        for (const workoutDoc of docSnap.docs) {
            const subCollectionRef = collection(db, 'Workout', workoutDoc.id, 'workout_exercise');
            const q2 = query(subCollectionRef, where('woe_exercise', '==', exe_id));
            const subDocSnap = await getDocs(q2);
            for (const subDoc of subDocSnap.docs) {
                await deleteDoc(doc(db, 'Workout', workoutDoc.id, 'workout_exercise', subDoc.id));
            }
        }
    }
    else if (workout_id !== null) {
        // dubplicate code needs to be refactored.
        const subCollectionRef = collection(db, 'Workout', workout_id, 'workout_exercise');
        const q2 = query(subCollectionRef, where('woe_exercise', '==', exe_id));
        const subDocSnap = await getDocs(q2);
        for (const subDoc of subDocSnap.docs) {
            await deleteDoc(doc(db, 'Workout', workout_id, 'workout_exercise', subDoc.id));
        }
    }
}


module.exports = {
    getSetDocument: getSetDocument,
    getHistory: getHistory,
    getExercises: getExercises,
    removeExercise: removeExercise,
    getFirebaseTimeStamp: getFirebaseTimeStamp,
    removeWorkoutExercise: removeWorkoutExercise
};