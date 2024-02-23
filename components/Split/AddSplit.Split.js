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
import { LoadingIndicator } from "../Misc/LoadingIndicator.Misc";

export function AddSplit({ navigation, route }) {

    const userId = route.params.userId;
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState([])
    const [isLoading, setLoading] = useState(true);
    const [isAddLoading, setAddLoading] = useState(true);

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
        setWorkoutPairs({ ...workoutPairs });
    }

    const onAddSplit = async () => {
        try {
            setAddLoading(true);
            await addReferenceWeek(workoutPairs, userId);
        } catch (error) {
            console.log(error);
        }
        finally {
            emitter.emit('splitEvent', 0);
            navigation.goBack();
        }
    }

    /*if (isAddLoading) {
        return (
            <LoadingIndicator text={ 'Adding split...'} />
        )
    }*/

    if (isLoading) {
        return (
            <LoadingIndicator text={ 'loading existing workouts...'} />
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
                        return (
                            <Card key={i} containerStyle={Styles.card}>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <View>
                                        <Text style={{ ...Styles.cardTitle, marginLeft: 0 }}>
                                            <MaterialCommunityIcons style={Styles.icon} name='calendar' size={22} />
                                            {' ' + day}
                                        </Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Menu>
                                                <MenuTrigger><MaterialCommunityIcons style={{ color: Styles.green.backgroundColor }} name='plus-circle' size={22} /></MenuTrigger>
                                                <MenuOptions >
                                                    {
                                                        data.map((workout, workoutIndex) => {
                                                            return (
                                                                <MenuOption key={workoutIndex} onSelect={() => onAttachWorkout(workout, day)}><Text style={{ fontSize: 16 }}>{workout.wor_name}</Text></MenuOption>
                                                            )
                                                        })
                                                    }
                                                </MenuOptions>
                                            </Menu>
                                            <Text style={{ ...Styles.fontColor, fontSize: 18 }}>{' ' + (workoutPairs[day] ? workoutPairs[day].wor_name : '')}</Text>
                                        </View>
                                    </View>
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