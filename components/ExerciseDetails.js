import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-elements'
import { ActivityIndicator } from 'react-native-paper';
import { REACT_APP_URL } from '@env';
import emitter from './customEventEmitter';
import { db } from '../firebaseConfig';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';

export function ExerciseDetails({ navigation, route }) {


    const exercise = route.params.exercise;
    const exerciseId = exercise.id;
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);


    const getSetDocument = async (docId) => {
        console.log(docId);
        const sets = query(collection(db, 'Exercise_history', docId, 'sets'));
        const docSnap = await getDocs(sets);
        var documentData = [];
        await docSnap.forEach(async (doc) => {
            documentData.push(await doc.data());
        });
        return { "exh_sets": documentData };
    };

    const getHistory = async () => {
        try {
            setLoading(true);
            console.log(exerciseId);
            const collectionRef = collection(db, 'Exercise_history');
            const q = query(collectionRef, where("exh_exe_id", "==", exerciseId));
            const docSnap = await getDocs(q);
            var documentData = [];
            var itemsProcessed = 0;
            docSnap.forEach(async (doc,) => {
                var tempDoc = await getSetDocument(doc.id);
                tempDoc = { exh_date: doc.data().exh_date, ...tempDoc };
                console.log(tempDoc);
                documentData.push(tempDoc);
                itemsProcessed++;
                if (itemsProcessed === docSnap.size) {
                    setLoading(false); // bro
                }
            });
            setData(documentData);
            console.log("Ok");
        }
        catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        getHistory();
    }, []);

    React.useEffect(() => {
        const listener = (data) => {
            console.log("event recieved");
            getHistory();
        };
        emitter.on('setEvent', listener);

        return () => {
            emitter.off('setEvent', listener);
        }

    }, []);
    // https://www.youtube.com/watch?v=v-1NJ99uZYk
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <ScrollView style={{ width: '100%' }}>{
                    data.map((exercise, i) => (
                        <Card key={i} containerStyle={{ padding: 0, borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                            <Card.Title style={{ padding: 10 }}>{new Timestamp(exercise.exh_date.seconds, exercise.exh_date.nanoseconds).toDate().toDateString()}</Card.Title>
                            <Card.Divider style={{ width: '100%', padding: 0, marginBottom: 0 }} />
                            {
                                (exercise.exh_sets !== null && exercise.exh_sets !== undefined) &&
                                exercise.exh_sets.map((set, i) => {
                                    return (
                                        <View key={i} >
                                            <Card.Divider style={{ width: '100%', padding: 0, marginBottom: 0 }} />
                                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                                <Text style={{ padding: 10, width: '50%' }}>{"Weight: " + set.set_weight + " kg"}</Text>
                                                <Text style={{ padding: 0 }}>{"Reps: " + set.set_reps}</Text>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </Card>
                    ))
                }</ScrollView>

            )}
            <TouchableOpacity style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
            }}>
                <Button onPress={() => { navigation.navigate('addSet', { exercise: exercise }) }} title='+' titleStyle={{ fontSize: 24 }} buttonStyle={{ width: 60, height: 60, borderRadius: 30, borderColor: '#1c7bc7' }} />
            </TouchableOpacity>
        </View>
    );
}



