import { Text, View, ActivityIndicator, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Button } from 'react-native-elements';
import emitter from './customEventEmitter';
import { getExercises, removeExercise as removeExerciseService, getFirebaseTimeStamp } from '../services/ExerciseService';

export function ExcerciseScreen({ navigation, route }) {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [masterDataSource, setMasterDataSource] = useState([]);

    const user = route.params.userInfo.user;
    // fetch exercises
    const load = async () => {
        try {
            setLoading(true);
            const exercises = await getExercises(user.id);

            setData(exercises);
            setFilteredDataSource(exercises);
            setMasterDataSource(exercises);
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

    const removeExercise = async (exe_id) => {
        try {
            await removeExerciseService(exe_id, user.id);
        }
        catch (error) {
            console.error(error)
        }
        finally {
            load();
        }
    };

    const searchFilterFunction = (text) => {
        // Check if searched text is not blank
        if (text) {
            // Inserted text is not blank
            // Filter the masterDataSource and update FilteredDataSource
            const newData = masterDataSource.filter(
                function (item) {
                    // Applying filter for the inserted text in search bar
                    var itemData = '';
                    if (item.exe_name != null) {
                        itemData = item.exe_name ? item.exe_name.toUpperCase() : ''.toUpperCase();
                    }
                    const textData = text.toUpperCase();
                    return itemData.indexOf(textData) > -1;
                }
            );
            setFilteredDataSource(newData);
            setSearch(text);
        } else {
            // Inserted text is blank
            // Update FilteredDataSource with masterDataSource
            setFilteredDataSource(masterDataSource);
            setSearch(text);
        }
    };

    React.useEffect(() => {
        const listener = (data) => {
            load();
        };
        emitter.on('exerciseEvent', listener);

        return () => {
            emitter.off('exerciseEvent', listener);
        }

    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: '100%', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignContent: 'center'}}>
                <TextInput onChangeText={(text) => searchFilterFunction(text)} style={{
                    height: 40,
                    borderBottomWidth: 1,
                    padding: 5,
                    margin: 5,
                    borderRadius: 6,
                    flexBasis: '85%',
                    alignSelf: 'flex-start'
                }}
                    placeholder='Search'
                />
            </View>
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                    <Text>Fetching exercises...</Text>
                </View>
            ) : (
                <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}>{

                    filteredDataSource.map((item, i) => {

                        var ExerciseDate = getFirebaseTimeStamp(item.exe_date.seconds, item.exe_date.nanoseconds);

                        return (
                            <TouchableOpacity key={i} onPress={() => { navigation.navigate('exerciseDetails', { exercise: item }) }}>
                                <Card containerStyle={{ borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Card.Title>{item.exe_name}</Card.Title>
                                        <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'flex-end' }}>
                                            <TouchableOpacity onPress={() => removeExercise(item.id)} style={{ margin: 0, padding: 3 }}>
                                                <MaterialCommunityIcons name="trash-can-outline" size={16} color='highcontrastdark' />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Card.Divider color='black'></Card.Divider>

                                    <Text><MaterialCommunityIcons name='weight-kilogram' size={16} />{item.exe_max_weight}</Text>

                                    <Text><MaterialCommunityIcons name='calendar-range' size={16} />{item.exe_date !== null ? ExerciseDate.toDateString() : "Never"}</Text>
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