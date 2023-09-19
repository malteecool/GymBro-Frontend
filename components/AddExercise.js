import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Button, Card, CheckBox } from "react-native-elements";
import emitter from "./customEventEmitter";
import { REACT_APP_URL } from '@env';
import { db } from '../firebaseConfig';
import { collection, getDoc, doc, addDoc, setDoc, query, getDocs, where, Timestamp, deleteDoc } from 'firebase/firestore';


async function postExercise(name, description, userid) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            exe_Name: name,
            exe_Description: description,
            exe_Max_Weight: 0,
            exe_Max_Reps: 0,
            exe_Date: new Date(),
            exe_usr_id: userid
        })
    };
    const response = await fetch(REACT_APP_URL + '/Exercise', requestOptions);

    console.log(REACT_APP_URL);
    const json = await response.json();
    console.log(json);
    return json;
}



async function postWorkoutExercise(exerciseId, workoutId) {

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    };

    const response = await fetch(`${REACT_APP_URL}/Workouts/${workoutId}/addexercise?exerciseId=${exerciseId}`, requestOptions);
    console.log(REACT_APP_URL);
    console.log(response.status);
    const json = await response.json();
    return json;
}

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
            console.log(route.params.userid)
            const documentData = {
                exe_date: Timestamp.fromDate(new Date()),
                exe_name: text,
                exe_max_reps: 0,
                exe_max_weight: 0,
                exe_usr_id: route.params.userid
            };
            const docRef = await addDoc(collection(db, "Exercise"), documentData);
            //console.log(await docRef.getDoc().data());
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
            // 0 used as a OK return code.
            emitter.emit('exerciseEvent', 0)
            emitter.emit('workoutExerciseEvent', 0);
            navigation.goBack();
        }
    }

    const addWorkoutExercise = async (exerciseId, workoutId, goBack) => {
        try {
            console.log("workoutid " + workoutId)
            console.log("reponseid " + exerciseId)
            const workoutResponse = await postWorkoutExercise(exerciseId, workoutId);
        }
        catch (error) {
            console.log(error);
        }
        setLoading(false);
        // 0 used as a OK return code.
        emitter.emit('exerciseEvent', 0)
        emitter.emit('workoutExerciseEvent', 0);
        navigation.goBack();

    }

    // fetch defaults
    useEffect(() => {
        setLoading(true);
        const getAllExercises = async () => {

            console.log("fetching default exercises");
            const collectionRef = collection(db, 'Default_exercises');
            const q = query(collectionRef);
            const docSnap = await getDocs(q);
            const docDataArray = [];
            await docSnap.forEach(async (doc) => {
                const docData = await doc.data();
                docDataArray.push(docData);
            });
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
                                        <TouchableOpacity onPress={() => item.exe_name != null ? addExercise(item.exe_name) : addWorkoutExercise(item.id, workoutId)}>
                                            <Card key={i} containerStyle={{ padding: 15, borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                                <Text>{item.exe_name != null ? item.exe_name : item.exe_name}</Text>
                                            </Card>
                                        </TouchableOpacity>
                                    )
                                })) :
                                (
                                    <TouchableOpacity onPress={() => addExercise(search)}>
                                        <Card>
                                            <Text >Nothing found, add: {search}</Text>
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