import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, addDoc } from "firebase/firestore";
import { getWeekNumber } from './StatsService.Service';
import { getWorkoutById } from './WorkoutService.Service';

async function getReferenceWeek(usr_id) {
    const collectionRef = collection(db, 'Split');
    const q = query(collectionRef, where("spl_usr_id", "==", usr_id));
    const docSnap = await getDocs(q);
    if (docSnap.docs[0].id) {
        const mainCollectionRef = collection(db, 'Split');
        const subCollectionRef = collection(mainCollectionRef, docSnap.docs[0].id, 'reference_week');
        const referenceDoc = await getDocs(subCollectionRef);

        let dataMap = {};
        if (referenceDoc.docs[0]) {
            const referenceData = referenceDoc.docs[0].data();
            for (let day in referenceData) {
                let workout = null;
                if (referenceData[day]) {
                    workout = await getWorkoutById(referenceData[day])
                } else if (referenceData[day] != null && referenceData[day] === '') {
                    console.log("empty id, adding restday")
                    workout = { wor_name: 'Rest day', id: '' };
                }
                dataMap = { ...dataMap, [day]: workout ? { workout } : null }
            }
        }


        return { ...dataMap, spl_ref_week: docSnap.docs[0].data().spl_ref_week };
    }
    return null;
}


async function addReferenceWeek(referenceWeek, usr_id) {

    const splitDocumentData = {
        spl_usr_id: usr_id,
        spl_ref_week: getWeekNumber(new Date())
    };
    const docRef = await addDoc(collection(db, 'Split'), splitDocumentData);

    if (docRef) {
        let refDocumentData = {};
        referenceWeek.forEach((pair) => {
            refDocumentData[pair.day] = pair.workout ? pair.workout.id : null;
        });

        const refDocRef = await addDoc(collection(db, 'Split', docRef.id, 'reference_week'), refDocumentData);
    }
}

function convertToWeekData(splitData) {

    const numberOfFutureWeeks = 5; // The number of week forward the split is calculated.
    const referenceWeekNumber = splitData.spl_ref_week;
    const currentWeekNumber = getWeekNumber(new Date());

    const weekIterations = currentWeekNumber - referenceWeekNumber + numberOfFutureWeeks;
    console.log(weekIterations);
    let weeks = [];
    // ordering the days accordingly, when retrieved from firebase they can be in the wrong order.
    const referenceWeekOrdered = {
        'Monday': splitData['Monday'],
        'Tuesday': splitData['Tuesday'],
        'Wednesday': splitData['Wednesday'],
        'Thursday': splitData['Thursday'],
        'Friday': splitData['Friday'],
        'Saturday': splitData['Saturday'],
        'Sunday': splitData['Sunday']
    };
    
    weeks.push(referenceWeekOrdered);
    const workoutSize = Object.values(weeks[0]).filter((workout) => workout).length;

    let dayCount = 0;
    let weekCount = 0;
    let workoutCount = 0;
    for (let i = 0; i < weekIterations; i++) {
        dayCount = 0;
        let pair = {};
        for (let j = 0; j < 7; j++) {
            if (workoutCount == workoutSize) {
                workoutCount = 0;
            }
            const day = Object.keys(referenceWeekOrdered)[dayCount];
            const workout = Object.values(referenceWeekOrdered)[workoutCount];
            pair = { ...pair, [day]: workout }
            dayCount++;
            workoutCount++;
        }
        weeks.push(pair);
        weekCount++;
    }
    return weeks.slice(-numberOfFutureWeeks);
}


module.exports = {
    getReferenceWeek: getReferenceWeek,
    addReferenceWeek: addReferenceWeek,
    convertToWeekData: convertToWeekData
};