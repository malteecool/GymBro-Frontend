import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, addDoc, updateDoc, getDoc, doc } from "firebase/firestore";
import { getWeekNumber } from './StatsService.Service';
import { getWorkoutById } from './WorkoutService.Service';

let splitId = null;

async function getSplitId(usr_id) {
    const collectionRef = collection(db, 'Split');
    const q = query(collectionRef, where("spl_usr_id", "==", usr_id));
    const docSnap = await getDocs(q);
    return docSnap.docs;
}

async function getReferenceWeek(usr_id) {

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const docs = await getSplitId(usr_id);
    if (docs[0].id) {

        splitId = docs[0].id;

        const subCollectionRef = collection(db, 'Split', docs[0].id, 'Split_week');
        const referenceDoc = await getDocs(subCollectionRef);

        let dataMap = [];

        for (let i = 0; i < 5; i++) {
            let doc = referenceDoc.docs[i];

            let weekMap = {}
            const ordinal = doc.data();
            const promises = [];
            const workoutMap = [];
            for (let day of weekDays) {
                promises.push(getDocs(collection(subCollectionRef, doc.id, day)));
            }

            await Promise.all(promises).then(responses => {
                responses.forEach((response, index) => {
                    if (response) {
                        const data = response.docs[0].data();
                        workoutMap.push({ dayIndex: index, workoutId: data.swk_wor_id, completed: data.swk_completed ? data.swk_completed : false });
                    }
                });
            });

            const workoutPromise = [];
            for (let workout of workoutMap) {
                if (workout && workout.workoutId) {
                    workoutPromise.push(getWorkoutById(workout.workoutId))
                } else {
                    workoutPromise.push(null);
                }
            }

            await Promise.all(workoutPromise).then(workouts => {
                workouts.forEach((workout, index) => {
                    if (!workout) {
                        console.log("empty id, adding restday")
                        workout = { wor_name: 'Rest day', id: '' };
                    }

                    weekMap[weekDays[index]] = { workout: workout, completed: workoutMap[index].completed, day: weekDays[index], weekId: doc.id }
                });
            });

            const weekMapOrdered = {
                'Monday': weekMap['Monday'],
                'Tuesday': weekMap['Tuesday'],
                'Wednesday': weekMap['Wednesday'],
                'Thursday': weekMap['Thursday'],
                'Friday': weekMap['Friday'],
                'Saturday': weekMap['Saturday'],
                'Sunday': weekMap['Sunday']
            };

            dataMap.push({ weekMapOrdered, ...ordinal });

        }

        // This is just needed to add the first view in the carousel, does not contain any data.
        dataMap.push({ weekMapOrdered: null, ordinal: -1 })
        dataMap.sort((a, b) => a.ordinal >= b.ordinal);
        const sorteredDataMap = dataMap.map((data) => data.weekMapOrdered);
        return { weeks: sorteredDataMap, spl_ref_week: docs[0].data().spl_ref_week };
    }
    return null;
}


async function markDayAsCompleted(weekId, day, completed) {
    const documentRef = await getDocs(collection(db, 'Split', splitId, 'Split_week', weekId, day))
    const documentId = documentRef.docs[0].id;
    updateDoc(doc(db, 'Split', splitId, 'Split_week', weekId, day, documentId), {
        swk_completed: completed
    });
}

async function addReferenceWeek(referenceWeek, usr_id) {

    const currentWeek = getWeekNumber(new Date());
    const splitDocumentData = {
        spl_usr_id: usr_id,
        spl_ref_week: currentWeek
    };

    try {
        const docRef = await addDoc(collection(db, 'Split'), splitDocumentData);

        const generatedWeeks = convertToWeekData(referenceWeek, currentWeek);
        console.log(generatedWeeks);

        Object.keys(generatedWeeks).forEach(async (week, i) => {

            // move this shit to promises

            const collectionRef = collection(db, 'Split', docRef.id, 'Split_week')
            const refDocRef = await addDoc(collectionRef, {
                ordinal: i
            });
            await addDoc(collection(collectionRef, refDocRef.id, 'Monday'), {
                swk_wor_id: generatedWeeks[week]['Monday'] ? generatedWeeks[week]['Monday'].id : null,
                swk_completed: false
            });
            await addDoc(collection(collectionRef, refDocRef.id, 'Tuesday'), {
                swk_wor_id: generatedWeeks[week]['Tuesday'] ? generatedWeeks[week]['Tuesday'].id : null,
                swk_completed: false
            })
            await addDoc(collection(collectionRef, refDocRef.id, 'Wednesday'), {
                swk_wor_id: generatedWeeks[week]['Wednesday'] ? generatedWeeks[week]['Wednesday'].id : null,
                swk_completed: false
            })
            await addDoc(collection(collectionRef, refDocRef.id, 'Thursday'), {
                swk_wor_id: generatedWeeks[week]['Thursday'] ? generatedWeeks[week]['Thursday'].id : null,
                swk_completed: false
            })
            await addDoc(collection(collectionRef, refDocRef.id, 'Friday'), {
                swk_wor_id: generatedWeeks[week]['Friday'] ? generatedWeeks[week]['Friday'].id : null,
                swk_completed: false
            })
            await addDoc(collection(collectionRef, refDocRef.id, 'Saturday'), {
                swk_wor_id: generatedWeeks[week]['Saturday'] ? generatedWeeks[week]['Saturday'].id : null,
                swk_completed: false
            })
            await addDoc(collection(collectionRef, refDocRef.id, 'Sunday'), {
                swk_wor_id: generatedWeeks[week]['Sunday'] ? generatedWeeks[week]['Sunday'].id : null,
                swk_completed: false
            })


        });

    } catch (error) {
        console.log(error);
    } finally {
        removeOldSplitIfExists(usr_id);
    }

}


async function removeOldSplitIfExists(usr_id) {

    const docs = await getSplitId(usr_id);

    if (docs && docs.length > 1 ) {

        //todo

    }

}

function convertToWeekData(splitData, refWeek) {

    const numberOfFutureWeeks = 5; // The number of week forward the split is calculated.
    const referenceWeekNumber = refWeek ? refWeek : getWeekNumber(new Date());
    const currentWeekNumber = getWeekNumber(new Date());

    const weekIterations = currentWeekNumber - referenceWeekNumber + numberOfFutureWeeks;
    console.log(weekIterations);
    let weeks = [];
    // ordering the days accordingly, when retrieved from firebase they can be in the wrong order.
    // this does not make any difference now. The order needs to be done when we fetch all of the split weeks instead. Leaving it for reference because it works.
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
    convertToWeekData: convertToWeekData,
    markDayAsCompleted: markDayAsCompleted
};