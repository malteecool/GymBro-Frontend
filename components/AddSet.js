import { View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Button } from 'react-native-elements';
import { ActivityIndicator } from 'react-native-paper';
import { Card2 } from './customCard';
import emitter from './customEventEmitter';
import { REACT_APP_URL } from '@env';
import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';


async function postExercise(id, sets) {

    try {
        console.log(sets);
        
        const documentData = {
            exh_date: Timestamp.fromDate(new Date()),
            exh_exe_id: id
        };
        const docRef = await addDoc(collection(db, 'Exercise_history'), documentData);
        console.log("doc id => " + await docRef.id);
        if (sets.length > 0) {
            sets.forEach(async (set) => {
                console.log("adding set:" + set);
                const setRef = await addDoc(collection(db, 'Exercise_history', docRef.id, 'sets'), {
                    set_reps: set.set_reps,
                    set_weight: set.set_weight
                });
            });
        }
    } catch (error) {
        console.log(error);
    }

}

export function AddSet({ navigation, route }) {

    const exercise = route.params.exercise;
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    console.log(exercise);
    
    const childToParent = (childData) => {
        setData(childData);
    }

    const onAddHistory = async () => {
        try {
            setLoading(true);
            await postExercise(exercise.id, data)
        }
        
        catch (error) {
            console.log(error);
        }
        finally {
            emitter.emit('setEvent', 0);
            emitter.emit('workoutEvent', 0);
            setLoading(false);
            navigation.goBack();
        }
    }

    return (
        <View style={{ flex:1 }}>{
            isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <View style={{flex:1}}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                        <Card2 historyId={exercise.id} childToParent={childToParent} />
                    </ScrollView>
                    <View style={{ position: 'absolute', width: '100%', bottom: 0 }}>
                        <Button title='Complete' onPress={onAddHistory} buttonStyle={{ margin: 10, height: 40 }} />
                    </View>
                </View>
            )
        }</View>
    )
}
