import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, addDoc, updateDoc, getDoc } from "firebase/firestore";
import { getWeekNumber } from './StatsService.Service';
import { getWorkoutById } from './WorkoutService.Service';



async function getReferenceWeek(usr_id) {

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const collectionRef = collection(db, 'Split');
    const q = query(collectionRef, where("spl_usr_id", "==", usr_id));
    const docSnap = await getDocs(q);
    if (docSnap.docs[0].id) {
        const subCollectionRef = collection(db, 'Split', docSnap.docs[0].id, 'Split_week');
        const referenceDoc = await getDocs(subCollectionRef);

        const currentWeek = getWeekNumber(new Date());
        const referenceWeek = docSnap.docs[0].data().spl_ref_week;
        console.log(referenceWeek);

        let dataMap = [];
        // weeks 
        for (let i = currentWeek - referenceWeek; i < 5; i++) {
            console.log(referenceDoc.docs.length)
            let doc = referenceDoc.docs[i];

            let weekMap = {}
            const ordinal = doc.data();

            for (const day of weekDays) {
                console.log(day);
                const dayRef = await getDocs(collection(subCollectionRef, doc.id, day));
                const dayData = dayRef.docs[0].data();

                let workout = null;

                if (dayData.swk_wor_id) {
                    //promises.push(getWorkoutById(referenceData[day]))
                    workout = await getWorkoutById(dayData.swk_wor_id);
                    //weekMap = { ...weekMap, [day]: { workout: workout, completed: false } }
                } else if (dayData.swk_wor_id != null && dayData.swk_wor_id === '') {
                    console.log("empty id, adding restday")
                    workout = { wor_name: 'Rest day', id: '' };
                }

                weekMap[day] = {workout: workout, completed: dayData.swk_completed }
            }

            const weekMapOrdered = {
                'Monday': weekMap['Monday'],
                'Tuesday': weekMap['Tuesday'],
                'Wednesday': weekMap['Wednesday'],
                'Thursday': weekMap['Thursday'],
                'Friday': weekMap['Friday'],
                'Saturday': weekMap['Saturday'],
                'Sunday': weekMap['Sunday']
            };

            dataMap.push(weekMapOrdered);

            console.log(ordinal);
            /*const promises = [
                getWorkoutById(referenceData['Monday']),
                getWorkoutById(referenceData['Tuesday']),
                getWorkoutById(referenceData['Wednesday']),
                getWorkoutById(referenceData['Thursday']),
                getWorkoutById(referenceData['Friday']),
                getWorkoutById(referenceData['Saturday']),
                getWorkoutById(referenceData['Sunday']),
            ]*/

            /*for (let day in referenceData) {
                console.log(day);
                let workout = null;
                //if (day && day.endsWith('_completed')) {
                //    weekMap[day] = {...weekMap[day], completed: referenceData[day]}
                //    continue;
                //}
                if (referenceData[day]) {
                    //promises.push(getWorkoutById(referenceData[day]))
                    workout = await getWorkoutById(referenceData[day]);
                    //weekMap = { ...weekMap, [day]: { workout: workout, completed: false } }
                } else if (referenceData[day] != null && referenceData[day] === '') {
                    console.log("empty id, adding restday")
                    workout = { wor_name: 'Rest day', id: '' };
                }

                

            }*/

            /*await Promise.all(promises).then(responses => {
                responses.forEach(response => {
                    if (response) {
                        console.log(response)
                        //weekMap = { ...weekMap, [day]: {workout: workout, completed: false} }
                    }
                });
            })*/



            

            
        }
        return { weeks: dataMap, spl_ref_week: docSnap.docs[0].data().spl_ref_week };
    }
    return null;
}


async function markDayAsCompleted(splitId, weekId, day, completed) {
    updateDoc(doc(db, 'Split', splitId, 'Split_week', weekId,), {

    })
}

async function addReferenceWeek(referenceWeek, usr_id) {

    const currentWeek = getWeekNumber(new Date());
    const splitDocumentData = {
        spl_usr_id: usr_id,
        spl_ref_week: currentWeek
    };
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

}

function convertToWeekData(splitData, refWeek) {

    console.log(splitData);

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
    convertToWeekData: convertToWeekData
};