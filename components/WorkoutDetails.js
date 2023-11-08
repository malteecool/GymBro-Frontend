import { useEffect, useLayoutEffect } from "react";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-elements";
import { Card } from "react-native-elements";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import emitter from "./customEventEmitter";
import { REACT_APP_URL } from '@env';

import { removeWorkoutExercise as removeWorkoutExerciseService, getFirebaseTimeStamp } from '../services/ExerciseService';
import { getWorkoutExercises } from '../services/WorkoutService';

// https://www.reactnativeschool.com/build-a-stop-watch-hook-that-works-even-when-the-app-is-quit

const updateWorkout = async (workoutid) => {
    console.log("post workout");

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            wor_name: null,
            wor_last_done: new Date(),
            wor_completed_count: 0,
            wor_workout_exercises: null
        })
    };
    const response = await fetch(REACT_APP_URL + '/Workouts/' + workoutid, requestOptions);

    console.log(REACT_APP_URL);
    const json = await response.json();
    return json;

}

export function WorkoutDetails({ navigation, route }) {

    const [running, setRunning] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [data, setData] = useState([]);
    const [time, setTime] = useState(0);

    const workout = route.params.workout;

    const load = async () => {
        try {
            setLoading(true);
            const documentData = await getWorkoutExercises(workout.id);
            setData(documentData);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const saveWorkout = async () => {
        try {
            setLoading(true);
            const responseJson = updateWorkout(workout.id);
            console.log(responseJson);
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
            emitter.emit('workoutEvent');
            navigation.goBack();
        }
    }

    const removeWorkoutExercise = async (exe_id) => {
        try {
            setLoading(true);
            await removeWorkoutExerciseService(workout.id, exe_id, null);
        } 
        catch (error) {
            console.log(error);
        }
        finally {
            load();
        }
    };

    useEffect(() => {
        const listener = (data) => {
            console.log("workout event recieved");
            load();
        };
        emitter.on('workoutExerciseEvent', listener);

        return () => {
            emitter.off('workoutExerciseEvent', listener);
        }

    }, []);

    const hours = Math.floor(time / 3600);

    // Minutes calculation
    const minutes = Math.floor((time / 100 % 3600) / 60);

    // Seconds calculation
    const seconds = time % 60;

    useEffect(() => {
        let intervalId;
        if (running) {
            intervalId = setInterval(() => {
                setTime(time + 1)
            }, 1000);
        }
        navigation.setOptions({
            title: `${workout.wor_name}: ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        });
        return () => clearInterval(intervalId);
    }, [running, time]);

    const startAndStop = () => {
        setRunning(!running);
    };
    // https://aloukissas.medium.com/how-to-build-a-background-timer-in-expo-react-native-without-ejecting-ea7d67478408
    return (
        <View style={{ flex: 1 }}>{isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        ) : (
            <View style={{ flex: 1 }}>
                <View>
                    <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 100 }}>
                        {
                            data.map((workout, i) => (
                                <TouchableOpacity key={workout.exe_name} onPress={() => { navigation.navigate('exerciseDetailsWorkout', { exercise: workout }) }}>
                                    <Card key={i} containerStyle={{ borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Card.Title>{workout.exe_name}</Card.Title>
                                            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'flex-end' }}>
                                                <TouchableOpacity onPress={() => removeWorkoutExercise(workout.id)} style={{ margin: 0, padding: 3 }}>
                                                    <MaterialCommunityIcons name="trash-can-outline" size={16} color='highcontrastdark' />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Card.Divider color='black'></Card.Divider>

                                        <Text><MaterialCommunityIcons name='weight-kilogram' size={16} />{workout.exe_max_weight}</Text>

                                        <Text><MaterialCommunityIcons name='calendar-range' size={16} />{workout.exe_date !== null ? getFirebaseTimeStamp(workout.exe_date.seconds, workout.exe_date.milliseconds).toDateString() : 'never'}</Text>
                                    </Card>
                                </TouchableOpacity>))
                        }
                    </ScrollView>

                </View>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: 45
                }}>
                    <View style={{ flex: 1, margin: 10, marginRight: 2 }}>
                        <Button title={running ? 'Stop' : 'Start'} onPress={() => { startAndStop() }} />
                    </View>
                    <View style={{ flex: 1, margin: 10, marginLeft: 2 }}>
                        <Button onPress={() => { navigation.navigate('addExercise', { userid: workout.wor_usr_id, workoutid: workout.id }) }} title='Add exercise' />
                    </View>
                </View>
                <View style={{ position: 'absolute', width: '100%', bottom: 0 }}>
                    <Button disabled={time <= 0} title='Complete' buttonStyle={{ margin: 10 }} onPress={() => { saveWorkout() }} />
                </View>
            </View>
        )}
        </View>
    )

}