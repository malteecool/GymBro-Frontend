import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Button, Card, CheckBox } from "react-native-elements";
import emitter from "./customEventEmitter";
import { REACT_APP_URL } from '@env';

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
            const response = await postExercise(text, '', userid);
            if (workoutId != null) {
                console.log("workoutid " + workoutId)
                console.log("reponseid " + response.id)
                const workoutResponse = await postWorkoutExercise(response.id, workoutId);
            }
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
        console.log(REACT_APP_URL);
        setLoading(true);

        const getAllExercises = async () => {

            console.log("fetching default exercises");
            console.log(REACT_APP_URL);
            try {
                const responseDefault = await fetch(REACT_APP_URL + '/Defaults?type=exercise&id=' + userid)
                const jsonDefault = await responseDefault.json();

                const responseUser = await fetch(REACT_APP_URL + '/exercise/' + userid);
                const jsonUser = await responseUser.json();

                const combined = jsonDefault.concat(jsonUser);
                console.log(combined)
                setFilteredDataSource(combined);
                setMasterDataSource(combined);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }


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
                    if (item.def_value != null) {
                        itemData = item.def_value ? item.def_value.toUpperCase() : ''.toUpperCase();
                    } else {
                        itemData = item.exe_Name ? item.exe_Name.toUpperCase() : ''.toUpperCase();
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
                                        <TouchableOpacity onPress={() => item.def_value != null ? addExercise(item.def_value) : addWorkoutExercise(item.id, workoutId)}>
                                            <Card key={i} containerStyle={{ padding: 15, borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                                <Text>{item.def_value != null ? item.def_value : item.exe_Name}</Text>
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