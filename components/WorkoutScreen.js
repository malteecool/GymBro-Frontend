import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Card, Button } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import emitter from './customEventEmitter'
import { REACT_APP_URL } from '@env';
import { db } from "../firebaseConfig";
import { collection, query, getDocs, where, Timestamp, getDoc, doc } from "firebase/firestore";

export function WorkoutScreen({ navigation, route }) {
    const [data, setData] = useState([]);

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

    const [isLoading, setLoading] = useState(true);
    const user = route.params.userInfo.user;

    const getWorkouts = async () => {
        console.log("fetching workouts");
        try {
            setLoading(true);
            const collectionRef = collection(db, 'Workout');
            const q = query(collectionRef, where("wor_usr_id", "==", user.usr_token));
            const docSnap = await getDocs(q);
            var workoutData = []
            // iterate each workout
            for (const doc of docSnap.docs) {
                var tempDoc = doc.data();
                var exerciseList = await getExerciseDocument(doc.id);
                tempDoc = { id: doc.id, wor_workout_exercises: exerciseList, ...tempDoc };
                workoutData.push(tempDoc);
            }
            setData(workoutData);
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getWorkouts();
    }, []);

    React.useEffect(() => {
        const listener = (data) => {
            console.log("event recieved");
            getWorkouts();
        };
        emitter.on('workoutEvent', listener);

        return () => {
            emitter.off('workoutEvent', listener);
        }

    }, []);

    const removeWorkout = async (name, id) => {

        try {
            setLoading(true);
            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            };
            console.log(REACT_APP_URL);
            const response = await fetch(REACT_APP_URL + '/Workouts/' + id, requestOptions);
        }
        catch (error) {
            console.error(error)
        }
        finally {
            getWorkouts();
        }
    }

    const warnUser = (name, id) => {
        Alert.alert('Remove workout', 'Are you sure you want to delete workout ' + name + '?', [
            {
                text: 'Cancel',
                onPress: () => { return; },
                style: 'cancel',
            },
            { text: 'OK', onPress: () => removeWorkout(name, id) },
        ]);
    }
    const getFormattedTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor((time % 60));
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {
                isLoading ? (<View><ActivityIndicator /><Text>Fetching Workouts...</Text></View>) : (
                    <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}>{

                        data.map((item, i) => {             
                            return (
                                <TouchableOpacity key={item.id} onPress={() => { navigation.navigate('workoutDetails', { workout: item }) }}>
                                    <Card key={i} containerStyle={{ borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Card.Title>{item.wor_name}</Card.Title>
                                            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'flex-end' }}>
                                                <TouchableOpacity onPress={() => warnUser(item.wor_name, item.id)} style={{ margin: 0, padding: 3 }}>
                                                    <MaterialCommunityIcons name="trash-can-outline" size={16} color='highcontrastdark' />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Card.Divider color='black'></Card.Divider>
                                        <Text><MaterialCommunityIcons name='calendar-range' size={16} /> {item.wor_last_done !== null ? new Timestamp(item.wor_last_done.seconds, item.wor_last_done.nanoseconds).toDate().toDateString() : 'never'}</Text>
                                        <Text><MaterialCommunityIcons name='dumbbell' size={16} /> {Object.keys(item.wor_workout_exercises).length}</Text>
                                        <Text><MaterialCommunityIcons name='clock-time-four-outline' size={16} /> {getFormattedTime(item.wor_estimate_time)}</Text>
                                    </Card>
                                </TouchableOpacity>
                            )
                        })
                    }</ScrollView>
                )
            }
            <TouchableOpacity style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
            }}>
                <Button onPress={() => { navigation.navigate('addWorkout', { userid: user.id }) }} title='+' titleStyle={{ fontSize: 24 }} buttonStyle={{ width: 60, height: 60, borderRadius: 30, borderColor: '#1c7bc7' }} />
            </TouchableOpacity>
        </View>
    )
}