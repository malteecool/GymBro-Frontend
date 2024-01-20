import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Button, Card, CheckBox } from "react-native-elements";
import emitter from "./customEventEmitter";
import { db } from '../firebaseConfig';
import { collection, addDoc, query, getDocs, Timestamp } from 'firebase/firestore';
import { getDefaultExercises, getExercises } from '../services/ExerciseService';

export function AddExercise({ navigation, route }) {
    const [isLoading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [masterDataSource, setMasterDataSource] = useState([]);

    const userid = route.params.userid;
    const workoutId = route.params.workoutid;

    const addExercise = async (text) => {
        try {
            setLoading(true);

            const documentData = {
                exe_date: Timestamp.fromDate(new Date()),
                exe_name: text,
                exe_max_reps: 0,
                exe_max_weight: 0,
                exe_usr_id: userid
            };
            const docRef = await addDoc(collection(db, "Exercise"), documentData);
            if (workoutId !== null) {
                await attachToWorkout(docRef.id, workoutId);
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
            // 0 used as a OK return code.
            emitter.emit('exerciseEvent', 0)
            if (workoutId != null) {
                emitter.emit('workoutExerciseEvent', 0);
            }
            navigation.goBack();
        }
    }

    const attachToWorkout = async (exerciseId, workoutId, goBack) => {
        try {
            const docRef = await addDoc(collection(db, 'Workout', workoutId, 'workout_exercise'), {
                woe_exercise: exerciseId
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    // fetch defaults
    useEffect(() => {
        setLoading(true);
        const getAllExercises = async () => {
            var docDataArray;
            if (workoutId != null) {
                docDataArray = await getExercises(userid);
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

    return (
        <View style={{ flex: 1, alignItems: 'center', }}>

            <TextInput onChangeText={(text) => searchFilterFunction(text)} style={{
                width: '93%',
                height: 40,
                borderBottomWidth: 1,
                padding: 5,
                margin: 5,
                borderRadius: 6
            }}

                placeholder='Search'
                value={search} />

            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' /* using 100% height and width as flex 1 is not working */ }}>
                {isLoading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator />
                    </View>
                ) : (
                    <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 120 }}>
                        {
                            filteredDataSource.length > 0 ? (
                                filteredDataSource.map((item, i) => {
                                    return (
                                        <TouchableOpacity key={i} onPress={() => addExercise(item.exe_name)}>
                                            <Card containerStyle={{ padding: 15, borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                                <Text>{item.exe_name != null ? item.exe_name : item.exe_name}</Text>
                                            </Card>
                                        </TouchableOpacity>
                                    )
                                })) :
                                (
                                    <TouchableOpacity onPress={() => addExercise(search)}>
                                        <Card>
                                            <Text>Nothing found, add: {search}</Text>
                                        </Card>
                                    </TouchableOpacity>
                                )

                        }
                    </ScrollView>
                )}
            </View>
        </View>
    );
}