import React, { useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Card, Button, Title } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { addReferenceWeek } from '../../services/SplitService';
import Styles from "../../Styles";
import {
    Menu,
    MenuProvider,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

export function AddSplit({ navigation, route }) {

    const userId = route.params.userId;
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setWorkoutPairs(workoutPairs);
        setRefreshing(false);
    }, []);

    const [workoutPairs, setWorkoutPairs] = useState([
        { day: 'Monday', workout: '' },
        { day: 'Tuesday', workout: null },
        { day: 'Wednesday', workout: null },
        { day: 'Thursday', workout: null },
        { day: 'Friday', workout: null },
        { day: 'Saturday', workout: null },
        { day: 'Sunday', workout: null }
    ]);

    const onAttachWorkout = (workout, index) => {
        let tempWorkoutPairs = workoutPairs;
        tempWorkoutPairs[index]['workout'] = workout;
        setWorkoutPairs([...tempWorkoutPairs]);
    }

    const onAddSplit = async () => {

        try {
            addReferenceWeek(workoutPairs, userId)
        } catch (error) {
            console.log(error);
        }
        finally {
            /*emitter.emit('exerciseEvent', 0);
            if (workoutId) {
                emitter.emit('workoutExerciseEvent', 0);
            }*/
            navigation.goBack();
        }
    }

    return (

        <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor }}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 75 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>{
                    workoutPairs.map((workoutPair, i) => {
                        return (
                            <Card key={i} containerStyle={Styles.card}>
                                <Card.Title style={Styles.cardTitle}><Text>{workoutPair['day']}</Text></Card.Title>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <View>
                                        <Menu style={{ width: 40 }} >
                                            <MenuTrigger><MaterialCommunityIcons style={{ color: Styles.green.backgroundColor }} name='plus-circle' size={40} /></MenuTrigger>
                                            <MenuOptions>
                                                <MenuOption onSelect={() => onAttachWorkout('Rest day', i)}><Text>Rest day</Text></MenuOption>
                                                <MenuOption onSelect={() => onAttachWorkout('Chest', i)}><Text>Chest</Text></MenuOption>
                                                <MenuOption onSelect={() => onAttachWorkout('Legs', i)}><Text>Legs</Text></MenuOption>
                                                <MenuOption onSelect={() => onAttachWorkout('Back', i)}><Text>Back</Text></MenuOption>
                                            </MenuOptions>

                                        </Menu>
                                    </View>
                                    <Text style={{ ...Styles.detailText, marginHorizontal: 10, justifyContent: 'center', textAlign: 'center'}}>{workoutPair['workout']}</Text>
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