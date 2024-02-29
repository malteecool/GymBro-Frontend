import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Card } from "react-native-elements";
import emitter from "../Custom/CustomEventEmitter.Custom";
import { getDefaultExercises, getExercises, addExercise } from '../../services/ExerciseService.Service';
import { attachToWorkout } from '../../services/WorkoutService.Service';
import Styles from "../../Styles";
import { LoadingIndicator } from "../Misc/LoadingIndicator.Misc";


export function AddExercise({ navigation, route }) {
    const [isLoading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [masterDataSource, setMasterDataSource] = useState([]);

    const userId = route.params.userId;
    const workoutId = route.params.workoutId;

    const onAddExercise = async (name, exerciseId) => {
        try {
            setLoading(true);
            if (workoutId && exerciseId) {
                await attachToWorkout(exerciseId, workoutId, masterDataSource.length);
            } else if (workoutId) {
                const newExerciseId = await addExercise(name, userId);
                await attachToWorkout(newExerciseId, workoutId, masterDataSource.length);
            } else {
                await addExercise(name, userId);
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
            emitter.emit('exerciseEvent', 0);
            if (workoutId) {
                emitter.emit('workoutExerciseEvent', 0);
            }
            navigation.goBack();
        }
    }

    // fetch defaults
    useEffect(() => {
        setLoading(true);
        const getAllExercises = async () => {
            var docDataArray;
            if (workoutId) {
                docDataArray = await getExercises(userId);
            } else {
                docDataArray = await getDefaultExercises();
            }
            setFilteredDataSource(docDataArray);
            setMasterDataSource(docDataArray);
            setLoading(false);
        };
        getAllExercises();
    }, []);

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

    if (isLoading) {
        return (
            <LoadingIndicator text={''} />
        )
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: Styles.dark.backgroundColor }}>

            <View style={Styles.searchContainer}>
                <TextInput
                    onChangeText={(text) => searchFilterFunction(text)}
                    style={Styles.searchBar}
                    placeholder='Search'
                    placeholderTextColor={Styles.fontColor.color}
                />
            </View>

            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 120 }}>
                    {
                        filteredDataSource.length > 0 ? (
                            filteredDataSource.map((item, i) => {
                                return (
                                    <TouchableOpacity key={i} onPress={() => onAddExercise(item.exe_name, item.id)}>
                                        <Card containerStyle={Styles.smallCard}>
                                            <Text style={{ ...Styles.detailText, margin: 0 }}>{item.exe_name != null ? item.exe_name : item.exe_name}</Text>
                                        </Card>
                                    </TouchableOpacity>
                                )
                            })) :
                            (
                                <TouchableOpacity onPress={() => onAddExercise(search)}>
                                    <Card containerStyle={Styles.smallCard}>
                                        <Text style={{ ...Styles.detailText, margin: 0 }}>Nothing found, add: {search}</Text>
                                    </Card>
                                </TouchableOpacity>
                            )
                    }
                </ScrollView>
            </View>
        </View>
    );
}