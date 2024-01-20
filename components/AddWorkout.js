import React, { useState, useEffect } from "react";
import { View, TextInput, ScrollView, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Card } from "react-native-elements";
import { TabView, TabBar } from 'react-native-tab-view';
import CustomExerciseView from "./CustomExerciseView";
import emitter from "./customEventEmitter";
import { postWorkoutExercise, addWorkout, addWorkoutWithExercises, getDefaultWorkouts } from '../services/WorkoutService';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, getDocs, Timestamp } from 'firebase/firestore';

export function AddWorkout({ navigation, route }) {
    const [isLoading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [masterDataSource, setMasterDataSource] = useState([]);
    const [index, setIndex] = React.useState(0);
    const [workoutName, setWorkoutName] = React.useState('');
    const [workoutTimeEstimate, setWorkoutTimeEstimate] = useState(0);
    const [workoutNameExample, setWorkoutNameExample] = useState('');
    const userid = route.params.userid;
    const workoutNameArray = ['Chest', 'Legs', 'Back'];
    const [selectedExercises, setSelectedExercises] = useState([]);

    const childToParent = (childData) => {
        setSelectedExercises(childData);
        console.log(selectedExercises);
    }

    useEffect(() => {
        setLoading(true);
        const getDefaultWorkoutsAsync = async () => {
            const docDataArray = await getDefaultWorkouts();
            setFilteredDataSource(docDataArray);
            setMasterDataSource(docDataArray);
            setLoading(false);
        }
        getDefaultWorkoutsAsync();
    }, []);

    const onAddWorkout = async (name) => {

        setLoading(true);
        try {
            if (selectedExercises.length > 0) {
                await addWorkoutWithExercises(name, selectedExercises, userid);
            } else {
                await addWorkout(name, userid);
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
            // 0 used as a OK return code.
            emitter.emit('workoutEvent', 0);
            navigation.goBack();
        }
    }

    const onAddWorkoutWithExercises = async (name) => {
        setLoading(true);

        setLoading(false);
    }

    const searchFilterFunction = (text) => {
        // Check if searched text is not blank
        if (text) {
            // Inserted text is not blank
            // Filter the masterDataSource and update FilteredDataSource
            const newData = masterDataSource.filter(
                function (item) {
                    // Applying filter for the inserted text in search bar
                    const itemData = item.def_name
                        ? item.def_name.toUpperCase()
                        : ''.toUpperCase();
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
    const [routes] = React.useState([
        { key: 'default', title: 'Default workout' },
        { key: 'custom', title: 'Custom workout' },
    ]);

    const responsiveTextStyle = StyleSheet.create({
        focused: { borderColor: '#2296f3' },
        unfocused: { borderColor: 'black' }
    });
    const [estimateFocus, setEstimateFocus] = useState(false);
    const [nameFocus, setNameFocus] = useState(false);

    const renderTabs = ({ route }) => {
        switch (route.key) {
            case 'default':
                return (
                    <View style={{ flex: 1, alignItems: 'center' }}>

                        <TextInput onChangeText={(text) => searchFilterFunction(text)} style={{
                            width: '93%',
                            height: 40,
                            margin: 12,
                            marginTop: 20,
                            borderBottomWidth: 1,
                            padding: 10,
                        }}
                            placeholder='Search'
                            value={search} />
                        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            {isLoading ? (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <ActivityIndicator />
                                </View>
                            ) : (
                                <ScrollView style={{ width: '100%', }} contentContainerStyle={{ paddingBottom: 120 }}>
                                    {
                                        filteredDataSource.length > 0 ? (
                                            filteredDataSource.map((item, i) => {
                                                return (
                                                    <TouchableOpacity onPress={() => onAddWorkout(item.def_name)}>
                                                        <Card key={i} containerStyle={{ padding: 15, borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                                                            <Text>{item.def_name}</Text>
                                                        </Card>
                                                    </TouchableOpacity>
                                                )
                                            })) :
                                            (
                                                <TouchableOpacity onPress={() => onAddWorkout(search, 0)}>
                                                    <Card>
                                                        <Text>Nothing found, add: {search}</Text>
                                                    </Card>
                                                </TouchableOpacity>
                                            )

                                    }
                                </ScrollView>
                            )}
                        </View>
                    </View >
                );
            case 'custom':
                return (
                    <View style={{ height: '100%', marginTop: 10 }}>
                        <Text style={{ margin: 5, fontSize: 16 }}>Name</Text>
                        <TextInput onChangeText={(text) => setWorkoutName(text)} style={[{
                            width: '93%',
                            height: 40,
                            borderBottomWidth: 1,
                            padding: 5,
                            margin: 5,
                            borderRadius: 6,
                            backgroundColor: '#fff'
                        }, nameFocus ? responsiveTextStyle.focused : responsiveTextStyle.unfocused]}
                            placeholder={workoutNameExample}
                            value={workoutName}
                            onFocus={() => setNameFocus(true)}
                            onBlur={() => setNameFocus(false)} />
                        <Text style={{ margin: 5, fontSize: 16 }}>Estimate Time</Text>
                        <View pointerEvents="auto">
                            <TextInput onChangeText={(text) => setWorkoutTimeEstimate(text)} style={[{
                                width: '93%',
                                height: 40,
                                borderBottomWidth: 1,
                                padding: 5,
                                margin: 5,
                                borderRadius: 6,
                                backgroundColor: '#fff',
                                },
                                estimateFocus ? responsiveTextStyle.focused : responsiveTextStyle.unfocused]}
                                keyboardType='numeric'
                                placeholder='0'
                                value={workoutTimeEstimate}
                                onFocus={() => setEstimateFocus(true)}
                                onBlur={() => setEstimateFocus(false)}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ margin: 5, fontSize: 16 }}>My exercises</Text>
                            <View style={{ flex: 1, backgroundColor: '#edeaea' }}>
                                <CustomExerciseView userid={userid} childToParent={childToParent} />
                            </View>
                        </View>
                        <View style={{ position: 'absolute', width: '100%', bottom: 10 }}>
                            <Button disabled={workoutName.length <= 0} title='Create' buttonStyle={{ margin: 10 }} onPress={() => { onAddWorkout(workoutName) }} />
                        </View>
                    </View>
                );
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <TabView

                swipeEnabled={true}
                renderTabBar={TabBar}

                navigationState={{ index, routes }}
                renderScene={renderTabs}
                onIndexChange={setIndex}
            />
        </View>
    );


}