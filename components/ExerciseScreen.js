import { Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Button } from 'react-native-elements';
import emitter from './customEventEmitter';
import { REACT_APP_URL } from '@env'


export function ExcerciseScreen({ navigation, route }) {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const user = route.params.userInfo.user;

    // fetch exercises
    const getExercises = async () => {
        console.log("fetching exercises");
        try {
            setLoading(true);
            console.log(REACT_APP_URL);

            const response = await fetch(REACT_APP_URL + '/exercise/' + user.id);

            const json = await response.json();
            setData(json);
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
        try {
            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            };
            console.log(REACT_APP_URL);
            
            const response = await fetch(REACT_APP_URL + '/Exercise/' + exe_id, requestOptions);
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
                        return (
                            <TouchableOpacity key={item.exe_Name} onPress={() => { navigation.navigate('exerciseDetails', { exercise: item }) }}>
                                <Card containerStyle={{ borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Card.Title>{item.exe_Name}</Card.Title>
                                        <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'flex-end' }}>
                                            <TouchableOpacity onPress={() => removeExercise(item.id)} style={{ margin: 0, padding: 3 }}>
                                                <MaterialCommunityIcons name="trash-can-outline" size={16} color='highcontrastdark' />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Card.Divider color='black'></Card.Divider>

                                    <Text><MaterialCommunityIcons name='weight-kilogram' size={16} />{item.exe_Max_Weight}</Text>

                                    <Text><MaterialCommunityIcons name='calendar-range' size={16} />{item.exe_Date !== null ? new Date(Date.parse(item.exe_Date)).toDateString() : 'never'}</Text>
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
                <Button onPress={() => { navigation.navigate('addExercise', { userid: user.id, workoutid: null }) }} title='+' titleStyle={{ fontSize: 24 }} buttonStyle={{ width: 60, height: 60, borderRadius: 30, borderColor: '#1c7bc7' }} />
            </TouchableOpacity>
        </View>
    )
}