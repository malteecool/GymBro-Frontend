import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import emitter from './customEventEmitter'
import { removeWorkout as removeWorkoutService, getWorkouts, getFirebaseTimeStamp } from '../services/WorkoutService';

export function WorkoutScreen({ navigation, route }) {
    const [data, setData] = useState([]);

    const [isLoading, setLoading] = useState(true);
    const user = route.params.userInfo.user;

    const load = async () => {
        console.log("fetching workouts");
        try {
            setLoading(true);
            const workouts = await getWorkouts(user.id);
            setData(workouts);
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);

    React.useEffect(() => {
        const listener = (data) => {
            load();
        };
        emitter.on('workoutEvent', listener);

        return () => {
            emitter.off('workoutEvent', listener);
        }

    }, []);

    const removeWorkout = async (workoutId) => {
        try {
            setLoading(true);
            await removeWorkoutService(workoutId);
        }
        catch (error) {
            console.log(error);
        }
        finally {
            load();
        }
    };

    const warnUser = (workout) => {
        Alert.alert('Remove workout', 'Are you sure you want to delete workout ' + workout.wor_name + '?', [
            {
                text: 'Cancel',
                onPress: () => { return; },
                style: 'cancel',
            },
            { text: 'OK', onPress: () => removeWorkout(workout.id) },
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
                                                <TouchableOpacity onPress={() => warnUser(item)} style={{ margin: 0, padding: 3 }}>
                                                    <MaterialCommunityIcons name="trash-can-outline" size={16} color='highcontrastdark' />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Card.Divider color='black'></Card.Divider>
                                        <Text><MaterialCommunityIcons name='calendar-range' size={16} /> {item.wor_last_done !== null ? getFirebaseTimeStamp(item.wor_last_done.seconds, item.wor_last_done.nanoseconds).toDateString() : 'never'}</Text>
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