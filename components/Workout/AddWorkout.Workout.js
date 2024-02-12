import React, { useState, useEffect } from "react";
import { View, TextInput, ScrollView, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Card } from "react-native-elements";
import { TabView, TabBar } from 'react-native-tab-view';
import CustomExerciseView from "../Custom/CustomExerciseView.Custom";
import emitter from "../Custom/CustomEventEmitter.Custom";
import { addWorkout, addWorkoutWithExercises, getDefaultWorkouts } from '../../services/WorkoutService.Service';
import Styles from "../../Styles";

export function AddWorkout({ navigation, route }) {
    const [isLoading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [masterDataSource, setMasterDataSource] = useState([]);
    const [index, setIndex] = React.useState(0);
    const [workoutName, setWorkoutName] = React.useState('');
    const [workoutTimeEstimate, setWorkoutTimeEstimate] = useState(0);
    const [selectedExercises, setSelectedExercises] = useState([]);

    const userid = route.params.userid;

    const childToParent = (childData) => {
        setSelectedExercises(childData);
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
                console.log("adding workout with exercises");
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

    const renderTabs = ({ route }) => {
        switch (route.key) {
            case 'default':
                return (
                    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#121111' }}>

                        <View style={Styles.searchContainer}>
                            <TextInput
                                onChangeText={(text) => searchFilterFunction(text)}
                                style={Styles.searchBar}
                                placeholder='Search'
                                placeholderTextColor={Styles.fontColor.color} // Lighter placeholder text color
                            />
                        </View>
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
                                                    <TouchableOpacity key={i} onPress={() => onAddWorkout(item.def_name)}>
                                                        <Card containerStyle={Styles.smallCard}>
                                                            <Text style={{ ...Styles.detailText, margin: 0 }}>{item.def_name}</Text>
                                                        </Card>
                                                    </TouchableOpacity>
                                                )
                                            })) :
                                            (
                                                <TouchableOpacity onPress={() => onAddWorkout(search, 0)}>
                                                    <Card containerStyle={Styles.smallCard}>
                                                        <Text style={{ ...Styles.detailText, margin: 0 }} >Nothing found, add: {search}</Text>
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
                    <View style={{ height: '100%', marginTop: 0, backgroundColor: '#121111' }}>
                        <View style={Styles.searchContainer}>
                            <TextInput onChangeText={(text) => setWorkoutName(text)} style={Styles.searchBar}
                                placeholder='Workout name'
                                placeholderTextColor='gray'
                                value={workoutName} />
                        </View>
                        <View style={Styles.searchContainer}>
                            <TextInput onChangeText={(text) => setWorkoutTimeEstimate(text)} style={Styles.searchBar}
                                keyboardType='numeric'
                                placeholder='Estimate time'
                                placeholderTextColor='gray'
                                value={workoutTimeEstimate}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1 }}>
                                <CustomExerciseView userid={userid} childToParent={childToParent} />
                            </View>
                        </View>
                        <View style={{ position: 'absolute', width: '100%', bottom: 10 }}>
                            <Button disabled={workoutName.length <= 0} title='Create' titleStyle={{ fontSize: 18 }} buttonStyle={{ margin: 10, backgroundColor: Styles.green.backgroundColor }} onPress={() => { onAddWorkout(workoutName) }} />
                        </View>
                    </View>
                );
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <TabView
                swipeEnabled={true}
                renderTabBar={props => <TabBar
                    {...props}
                    style={Styles.green}
                    renderLabel={({ route, color }) => (
                        <Text style={{ fontSize: 18, ...Styles.fontColor }}>
                            {route.title}
                        </Text>
                    )}
                />}
                navigationState={{ index, routes }}
                renderScene={renderTabs}
                onIndexChange={setIndex}
            />
        </View>
    );


}