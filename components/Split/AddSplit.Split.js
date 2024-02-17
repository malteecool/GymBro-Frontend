import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Card, Button, Title } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { addReferenceWeek } from '../../services/SplitService.Service';
import { getWorkouts } from '../../services/WorkoutService.Service';
import Styles from "../../Styles";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import emitter from "../Custom/CustomEventEmitter.Custom";

export function AddSplit({ navigation, route }) {

    const userId = route.params.userId;
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState([])
    const [isLoading, setLoading] = useState(true);

    const _onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setWorkoutPairs(workoutPairs);
        setRefreshing(false);
    }, []);

    const [workoutPairs, setWorkoutPairs] = useState(
        {
            'Monday': null,
            'Tuesday': null,
            'Wednesday': null,
            'Thursday': null,
            'Friday': null,
            'Saturday': null,
            'Sunday': null
        }
    );

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const workouts = await getWorkouts(userId);
            const restDayWorkout = {
                id: '',
                wor_name: 'Rest day'
            }
            setData([restDayWorkout, ...workouts,]);
            setLoading(false);
        }
        load();
    }, []);

    const onAttachWorkout = (workout, day) => {
        workoutPairs[day] = workout;
        setWorkoutPairs({...workoutPairs});
        console.log(workoutPairs);
    }

    const onAddSplit = async () => {
        try {
            await addReferenceWeek(workoutPairs, userId);
        } catch (error) {
            console.log(error);
        }
        finally {
            emitter.emit('splitEvent', 0);
            navigation.goBack();
        }
    }

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor }}>
                <ActivityIndicator style={Styles.activityIndicator} />
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor }}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 75 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={_onRefresh} />
                }>{
                    Object.keys(workoutPairs).map((day, i) => {
                        console.log(day);
                        console.log(workoutPairs[day])
                        return (
                            <Card key={i} containerStyle={Styles.card}>
                                <Card.Title style={Styles.cardTitle}><Text>{day}</Text></Card.Title>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <View>
                                        <Menu style={{ width: 40 }} >
                                            <MenuTrigger><MaterialCommunityIcons style={{ color: Styles.green.backgroundColor }} name='plus-circle' size={40} /></MenuTrigger>
                                            <MenuOptions>
                                                {
                                                    data.map((workout, workoutIndex) => {
                                                        return (
                                                            <MenuOption onSelect={() => onAttachWorkout(workout, day)}><Text>{workout.wor_name}</Text></MenuOption>
                                                        )
                                                    })
                                                }
                                            </MenuOptions>

                                        </Menu>
                                    </View>
                                    <Text style={{ ...Styles.detailText, marginHorizontal: 10, justifyContent: 'center', textAlign: 'center' }}>{workoutPairs[day] ? workoutPairs[day].wor_name : ''}</Text>
                                </View>

                            </Card>
                        );
                    })
                }
            </ScrollView>
            <View style={{ position: 'absolute', width: '100%', bottom: 0 }}>
                <Button title='Add split' buttonStyle={{ margin: 10, ...Styles.green }} onPress={() => { onAddSplit() }} />
            </View>

        </View>

    )

}