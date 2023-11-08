import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-elements'
import { ActivityIndicator } from 'react-native-paper';
import emitter from './customEventEmitter';
import { getHistory, getFirebaseTimeStamp } from '../services/ExerciseService'

export function ExerciseDetails({ navigation, route }) {

    const exercise = route.params.exercise;
    const exerciseId = exercise.id;
    const [isLoading, setLoading] = useState(true);
    const [isEmpty, setEmpty] = useState(true);
    const [data, setData] = useState([]);

    const load = async () => {
        try {
            setLoading(true);
            const history = await getHistory(exerciseId);
            setData(history);
            setLoading(false);
            setEmpty(history.length == 0);
        }
        catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        load();
    }, []);

    React.useEffect(() => {
        const listener = (data) => {
            console.log("event recieved");
            load();
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
            ) : (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {!isEmpty ? (
                    <ScrollView style={{ width: '100%' }}>{
                        data.map((exercise, i) => (
                            <Card key={i} containerStyle={{ padding: 0, borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                <Card.Title style={{ padding: 10 }}>{getFirebaseTimeStamp(exercise.exh_date.seconds, exercise.exh_date.nanoseconds).toDateString()}</Card.Title>
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
                    }
                    </ScrollView>
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text>No sets yet</Text>
                    </View>
                )}
            </View>

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



