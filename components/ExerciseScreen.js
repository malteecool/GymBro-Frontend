import { Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Button } from 'react-native-elements';
import emitter from './customEventEmitter';
import { REACT_APP_URL } from '@env';
import { db } from '../firebaseConfig';
import { collection, getDoc, doc, addDoc, setDoc, query, getDocs, where, Timestamp, deleteDoc } from 'firebase/firestore';


export function ExcerciseScreen({ navigation, route }) {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const user = route.params.userInfo.user;

    // fetch exercises
    const getExercises = async () => {
        console.log("fetching exercises");
        try {
            setLoading(true);
            console.log("user => " + user.usr_token);
            const collectionRef = collection(db, 'Exercise');
            const q = query(collectionRef, where("exe_usr_id", "==", user.usr_token));
            const docSnap = await getDocs(q);

            // would need a remap to create database like objects with id received from doc.id
            var documentData = [];
            docSnap.forEach(async (doc) => {
                var exerciseDoc = { "id": doc.id, ...doc.data() };
                console.log(exerciseDoc);
                documentData.push(exerciseDoc);
            })
            setData(documentData);
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getExercises();
    }, []);

    const removeExercise = async (exe_id) => {
        // todo
        try {
            console.log("delete exercise with id: " + exe_id);
            /*const result = await deleteDoc(doc(db, "exercise", exe_id));
            console.log(result);*/

            const docRef = doc(db, "Exercise", exe_id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log(docSnap.data());
            }

        }
        catch (error) {
            console.error(error)
        }
        finally {
            getExercises();
        }
    };


    // on callback from add screen
    React.useEffect(() => {
        const listener = (data) => {
            console.log("event recieved");
            getExercises();
        };
        emitter.on('exerciseEvent', listener);

        return () => {
            emitter.off('exerciseEvent', listener);
        }

    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                    <Text>Fetching exercises...</Text>
                </View>
            ) : (
                <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}>{

                    data.map((item, i) => {

                        var ExerciseDate = new Timestamp(item.exe_date.seconds, item.exe_date.nanoseconds).toDate();

                        return (
                            <TouchableOpacity key={item.exe_name} onPress={() => { navigation.navigate('exerciseDetails', { exercise: item }) }}>
                                <Card containerStyle={{ borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Card.Title>{item.exe_name}</Card.Title>
                                        <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'flex-end' }}>
                                            <TouchableOpacity onPress={() => removeExercise(item.id)} style={{ margin: 0, padding: 3 }}>
                                                <MaterialCommunityIcons name="trash-can-outline" size={16} color='highcontrastdark' />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Card.Divider color='black'></Card.Divider>

                                    <Text><MaterialCommunityIcons name='weight-kilogram' size={16} />{item.exe_max_weight}</Text>

                                    <Text><MaterialCommunityIcons name='calendar-range' size={16} />{item.exe_date !== null ? ExerciseDate.toDateString() : "Never"}</Text>
                                </Card>
                            </TouchableOpacity>
                        )
                    })

                }</ScrollView>
            )}
            <TouchableOpacity style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
            }}>
                <Button onPress={() => { navigation.navigate('addExercise', { userid: user.usr_token, workoutid: null }) }} title='+' titleStyle={{ fontSize: 24 }} buttonStyle={{ width: 60, height: 60, borderRadius: 30, borderColor: '#1c7bc7' }} />
            </TouchableOpacity>
        </View>
    )
}