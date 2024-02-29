import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import emitter from '../Custom/CustomEventEmitter.Custom'
import { removeWorkout as removeWorkoutService, getWorkouts, getFirebaseTimeStamp } from '../../services/WorkoutService.Service';
import Styles from '../../Styles';
import { LoadingIndicator } from '../Misc/LoadingIndicator.Misc';


export function WorkoutScreen({ navigation, route }) {
    const [data, setData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const user = route.params.userInfo.user;

    const load = async () => {
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

    useEffect(() => {
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

    const _onRefresh = React.useCallback(() => {
        load();
    }, []);


    if (isLoading) {
        return (
            <LoadingIndicator text={'Loading workouts...'} />
        )
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Styles.dark.backgroundColor }}>
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_onRefresh} />}
            >{

                data.map((item, i) => {
                    return (
                        <TouchableOpacity key={item.id} onPress={() => { navigation.navigate('workoutDetails', { workout: item }) }}>
                            <Card containerStyle={Styles.card}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View>
                                        <Text style={Styles.cardTitle}>
                                            {item.wor_name}
                                        </Text>
                                        <Text style={{ ...Styles.fontColor, marginLeft: 10 }}>
                                            {/*<MaterialCommunityIcons style={{ ...Styles.icon, paddingRight: 10 }} name='dumbbell' size={16} />
                                                    {Object.keys(item.wor_workout_exercises).length}*/}
                                            <MaterialCommunityIcons style={Styles.icon} name='clock-time-four-outline' size={16} /> {getFormattedTime(item.wor_estimate_time) + '  '}
                                            <MaterialCommunityIcons style={Styles.icon} name='calendar-range' size={16} />
                                            {item.wor_last_done !== null ? ' ' + getFirebaseTimeStamp(item.wor_last_done.seconds, item.wor_last_done.nanoseconds).toDateString() : 'never'}

                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => warnUser(item)} style={Styles.trashIcon}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={20} style={Styles.icon} />
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    )
                })
            }</ScrollView>

            <TouchableOpacity style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
            }}>
                <Button onPress={() => { navigation.navigate('addWorkout', { userid: user.id }) }} title='+' titleStyle={{ fontSize: 24 }} buttonStyle={{ width: 60, height: 60, borderRadius: 30, borderColor: '#1c7bc7', backgroundColor: Styles.green.backgroundColor }} />
            </TouchableOpacity>
        </View>
    )
}