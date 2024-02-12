import { Text, View, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Button } from 'react-native-elements';
import emitter from '../Custom/CustomEventEmitter.Custom';
import { getExercises, removeExercise as removeExerciseService, getFirebaseTimeStamp } from '../../services/ExerciseService.Service';
import Styles from '../../Styles';
import { LoadingIndicator } from '../Misc/LoadingIndicator.Misc';


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
            setLoading(true);
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

    useEffect(() => {
        const listener = (data) => {
            load();
        };
        emitter.on('exerciseEvent', listener);

        return () => {
            emitter.off('exerciseEvent', listener);
        }

    }, []);

    if (isLoading) {
        return (<LoadingIndicator text={'Loading exercises...'} />)
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Styles.dark.backgroundColor }}>
            <View style={Styles.searchContainer}>
                <TextInput
                    onChangeText={(text) => searchFilterFunction(text)}
                    style={Styles.searchBar}
                    placeholder='Search'
                    placeholderTextColor={Styles.fontColor.color} // Lighter placeholder text color
                />
            </View>
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}>{
                filteredDataSource.map((item, i) => {

                    var exerciseDate = getFirebaseTimeStamp(item.exe_date.seconds, item.exe_date.nanoseconds);

                    return (
                        <TouchableOpacity key={i} onPress={() => { navigation.navigate('exerciseDetails', { exercise: item },) }}>
                            <Card containerStyle={Styles.card}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View>
                                        <Text style={Styles.cardTitle}>
                                            {item.exe_name}
                                        </Text>
                                        <Text style={{ ...Styles.fontColor, marginLeft: 10 }}>
                                            <MaterialCommunityIcons style={{ ...Styles.icon, paddingRight: 10 }} name='weight-kilogram' size={16} />
                                            {' ' + item.exe_max_weight + '  '}
                                            <MaterialCommunityIcons style={Styles.icon} name='calendar-range' size={16} />
                                            {' ' + (item.exe_date !== null ? exerciseDate.toDateString() : "Never")}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeExercise(item.id)} style={Styles.trashIcon}>
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
                <Button onPress={() => { navigation.navigate('addExercise', { userId: user.id, workoutid: null }) }} title='+' titleStyle={{ fontSize: 24 }} buttonStyle={{ width: 60, height: 60, borderRadius: 30, borderColor: '#1c7bc7', backgroundColor: Styles.green.backgroundColor }} />
            </TouchableOpacity>
        </View>
    )
}