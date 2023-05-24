import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-elements'
import { ActivityIndicator } from 'react-native-paper';
import { REACT_APP_URL } from '@env';
import emitter from './customEventEmitter';

export function ExerciseDetails({ navigation, route }) {

    
    const exercise = route.params.exercise;
    const exerciseId = exercise.id;
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const getHistory = async () => {
        try {
            setLoading(true);
            console.log(REACT_APP_URL);
            
            const response = await fetch(REACT_APP_URL + '/Exercise/' + exerciseId + '/history');

            const json = await response.json();
            setData(json);
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
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
                            <Card.Title style={{ padding: 10 }}>{new Date(Date.parse(exercise.exh_Date)).toDateString()}</Card.Title>
                            <Card.Divider style={{ width: '100%', padding: 0, marginBottom: 0 }} />
                            {
                                (exercise.exh_sets !== null && exercise.exh_sets !== undefined) &&
                                exercise.exh_sets.map((set, i) => {
                                    return (
                                        <View key={i} >
                                            <Card.Divider style={{ width: '100%', padding: 0, marginBottom: 0 }} />
                                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                                <Text style={{ padding: 10, width: '50%' }}>{"Weight: " + set.set_Weight + " kg"}</Text>
                                                <Text style={{ padding: 0 }}>{"Reps: " + set.set_Reps}</Text>
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



