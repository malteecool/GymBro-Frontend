import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, Timestamp, deleteDoc, doc, updateDoc, getDoc, addDoc } from "firebase/firestore";

const EXERCISE = 'Exercise'

async function getExercises(usr_id) {
    var documentData = [];
    try {
        const collectionRef = collection(db, 'Exercise');
        const q = query(collectionRef, where("exe_usr_id", "==", usr_id));
        const docSnap = await getDocs(q);
        for (const doc of docSnap.docs) {
            var exerciseDoc = { "id": doc.id, ...doc.data() };
            documentData.push(exerciseDoc);
        }
        documentData.sort((a, b) => a.exe_date <= b.exe_date);
    }
    catch (error) {
        console.error(error)
    }
    return documentData;
};

async function getDefaultExercises() {
    const collectionRef = collection(db, 'Default_exercises');
    const q = query(collectionRef);
    const docSnap = await getDocs(q);
    const docDataArray = [];
    docSnap.forEach(async (doc) => {
        const docData = doc.data();
        docDataArray.push(docData);
    });
    return docDataArray;
}

async function getSetDocument(docId) {
    const sets = query(collection(db, 'Exercise_history', docId, 'sets'));
    const docSnap = await getDocs(sets);
    var documentData = [];
    docSnap.forEach(async (doc) => {
        documentData.push(doc.data());
    });

    documentData.sort((a, b) => a.set_order >= b.set_order);
    return { "exh_sets": documentData };
};

async function getHistory(exerciseId, date) {
    var documentData = [];
    try {
        const collectionRef = collection(db, 'Exercise_history');
        const q = query(collectionRef, where("exh_exe_id", "==", exerciseId));
        const docSnap = await getDocs(q);
        if (docSnap.size > 0) {
            for (const doc of docSnap.docs) {
                var tempDoc = await getSetDocument(doc.id);
                tempDoc = { exh_date: doc.data().exh_date, ...tempDoc };
                if (!date || (date && getFirebaseTimeStamp(tempDoc.exh_date.seconds, tempDoc.exh_date.nanoseconds) > date)) {
                    documentData.push(tempDoc);
                }

            }
            documentData.sort((a, b) => a.exh_date <= b.exh_date);
        }
    }
    catch (error) {
        console.log(error);
    }
    return documentData;
};




async function getHistoryByUser(userId) {
    var documentData = [];
    try {
        const collectionRef = collection(db, 'Exercise_history');
        const q = query(collectionRef, where("exh_usr_id", "==", userId));
        const docSnap = await getDocs(q);
        if (docSnap.size > 0) {
            for (const doc of docSnap.docs) {
                documentData.push(doc.data());
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    return documentData;
}


function getFirebaseTimeStamp(seconds, nanoseconds) {
    return new Timestamp(seconds, nanoseconds).toDate();
}

async function removeExerciseHistory(exerciseId) {
    try {
        const collectionRef = collection(db, 'Exercise_history');
        const q = query(collectionRef, where("exh_exe_id", "==", exerciseId));
        const docSnap = await getDocs(q);
        console.log('deleting exercise history')
        for (const historyDoc of docSnap.docs) {
            console.log(historyDoc.id);
            await deleteDoc(doc(db, 'Exercise_history', historyDoc.id));
        }
    } catch (error) {
        console.log(error);
    }
}

async function removeExercise(exe_id, usr_id) {
    try {
        console.log("delete exercise with id: " + exe_id);
        const docRef = await deleteDoc(doc(db, "Exercise", exe_id));
        await removeWorkoutExercise(null, exe_id, usr_id);

        removeExerciseHistory(exe_id);

    }
    catch (error) {
        console.error(error)
    }
}

async function updateExerciseDate(exe_id) {
    const date = new Date();
    updateDoc(doc(db, 'Exercise', exe_id), {
        exe_date: new Timestamp.fromDate(new Date())
    });
}

async function addExercise(name, usr_id) {
    const documentData = {
        exe_date: Timestamp.fromDate(new Date()),
        exe_name: name,
        exe_max_reps: 0,
        exe_max_weight: 0,
        exe_usr_id: usr_id
    };
    const docRef = await addDoc(collection(db, "Exercise"), documentData);
    return docRef.id;
}

async function updateExerciseMaxWeight(exe_id, weight) {
    const docSnap = await getDoc(doc(db, 'Exercise', exe_id));
    if (weight > docSnap.data().exe_max_weight) {
        updateDoc(doc(db, 'Exercise', exe_id), {
            exe_max_weight: weight
        });
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
    removeWorkoutExercise: removeWorkoutExercise,
    updateExerciseDate: updateExerciseDate,
    updateExerciseMaxWeight: updateExerciseMaxWeight,
    getDefaultExercises: getDefaultExercises,
    getHistoryByUser: getHistoryByUser,
    addExercise: addExercise,
};