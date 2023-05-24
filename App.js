import { Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-elements';
import { ExerciseDetails } from './components/ExerciseDetails';
import { AddExercise } from './components/AddExercise';
import { AddSet } from './components/AddSet';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { AsyncStorage } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { REACT_APP_URL } from '@env'

import { ExcerciseScreen } from './components/ExerciseScreen';
import { WorkoutScreen } from './components/WorkoutScreen';
import { WorkoutDetails } from './components/WorkoutDetails';
import emitter from "./components/customEventEmitter";
import { AddWorkout } from './components/AddWorkout';

WebBrowser.maybeCompleteAuthSession();


const Stack = createNativeStackNavigator();

function ExerciseStackScreen(userInfo) {
    return (
        <Stack.Navigator >
            <Stack.Screen name='excercises'
                component={ExcerciseScreen}
                initialParams={{ userInfo: userInfo }}
                options={{ headerShown: false }} />
            <Stack.Screen name='exerciseDetails' component={ExerciseDetails} options={({ route }) => ({ title: route.params.exercise.exe_Name })} />
            <Stack.Screen name='addExercise' component={AddExercise} options={({ route }) => ({ title: 'New exercise' })} />
            <Stack.Screen name='addSet' component={AddSet} options={({ route }) => ({ title: route.params.exercise.exe_Name })} />
        </Stack.Navigator>
    )
}

function WorkoutStackScreen(userInfo) {
    return (
        <Stack.Navigator>
            <Stack.Screen name='workouts' component={WorkoutScreen} initialParams={{ userInfo: userInfo }} options={{ headerShown: false }} />
            <Stack.Screen name='workoutDetails' component={WorkoutDetails} options={({ route }) => ({ title: route.params.workout.wor_name })} />
            <Stack.Screen name='exerciseDetailsWorkout' component={ExerciseDetails} options={({ route }) => ({ title: route.params.exercise.exe_Name })} />
            <Stack.Screen name='addExercise' component={AddExercise} options={({ route }) => ({ title: 'New exercise' })} />
            <Stack.Screen name='addSet' component={AddSet} options={({ route }) => ({ title: route.params.exercise.exe_Name })} />
            <Stack.Screen name='addWorkout' component={AddWorkout} options={({ route }) => ({ title: 'New workout' })} />
        </Stack.Navigator>
    )
}

const Tab = createMaterialBottomTabNavigator();


const updateExercisesEmitter = () => {
    console.log("event emitted");
    emitter.emit('exerciseEvent', 0)
}

const updateWorkoutEmitter = () => {
    console.log("workout event emitted");
    emitter.emit('workoutEvent', 0)
}

const getUserData = async (auth) => {

    console.log(auth.accessToken);
    let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    const responseJson = await userInfoResponse.json();
    console.log('getUserdata:');
    console.log(responseJson);


    return responseJson;
};

const addUser = async (userData) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usr_name: userData.name,
                usr_token: userData.id
            })
        };
        console.log(REACT_APP_URL);

        const response = await fetch(REACT_APP_URL + '/users', requestOptions);
        if (response.status == 201) {
            console.log('user added');
            const json = await response.json();
            console.log(json);
            return json;
        } else {
            console.log(response);
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}

const logout = async () => {
    console.log('removing auth');
    await AsyncStorage.removeItem('auth');
};

const getClientId = () => {
    if (Platform.OS === 'ios') {
        return process.env.REACT_APP_TOKEN;
    } else if (Platform.OS === 'android') {
        return process.env.REACT_APP_TOKEN;
    } else {
        console.log('Invalid platform - not handled');
    }
}

const userExist = async (token) => {
    console.log(token);

    
    const response = await fetch(`${REACT_APP_URL}/users/${token}`);
    if (response.status == 404) {
        return null;
    }
    const json = await response.json();
    return json;
}


// hadles login
export default function App() {
    const [userInfo, setUserInfo] = useState();
    const [auth, setAuth] = useState();
    const [requireRefresh, setRequireRefresh] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.REACT_APP_TOKEN,
    });


    console.log(REACT_APP_URL);

    // first time sign in
    useEffect(() => {
        if (response?.type === 'success') {
            setAuth(response.authentication);
            setLoading(true);
            //store user session so he does not need to login every time he enter the app.
            const persistAuth = async () => {
                await AsyncStorage.setItem('auth', JSON.stringify(response.authentication));
                await getPersistedAuth();
            };
            persistAuth();
        }
    }, [response]);

    useEffect(() => {
        // check if user data exists;
        getPersistedAuth();
    }, []);

    const getPersistedAuth = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('auth');
            const authFromJson = jsonValue ? JSON.parse(jsonValue) : null;
            if (authFromJson) {
                setAuth(authFromJson);
                const isTokenFresh = AuthSession.TokenResponse.isTokenFresh({
                    expiresIn: authFromJson.expiresIn,
                    issuedAt: authFromJson.issuedAt
                });
                setRequireRefresh(!isTokenFresh);
                const userData = await getUserData(authFromJson);
                if (userData.id) {
                    const dbUser = await userExist(userData.id);
                    if (dbUser) {
                        setUserInfo(dbUser);
                    } else {
                        const newUser = await addUser(userData);
                        setUserInfo(newUser);
                    }
                } else if (userData.error?.code == 401) {
                    const clientId = getClientId();
                    const tokenResult = await AuthSession.refreshAsync({
                        clientId: clientId,
                        refreshToken: authFromJson.refreshToken
                    }, {
                        tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token'
                    });
                    tokenResult.refreshToken = authFromJson.refreshToken;
                    setAuth(tokenResult);
                    await AsyncStorage.setItem('auth', JSON.stringify(tokenResult));
                    setRequireRefresh(false);
                    const userData = await getUserData(tokenResult);
                    const dbUser = await userExist(userData.id);
                    if (dbUser) {
                        setUserInfo(dbUser);
                    }
                }
            } else {
                console.log('auth is null, user needs to sign in.');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {

    };

    return (
        <NavigationContainer>{
            isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                    <Text>Logging in...</Text>
                </View>
            ) : ((auth && userInfo) ? (
                <Tab.Navigator>
                    <Tab.Screen name='exerciseStack'
                        children={() => <ExerciseStackScreen user={userInfo} />}
                        options={{
                            tabBarLabel: 'Excercises',
                            tabBarIcon: ({ color }) => (<MaterialCommunityIcons name='dumbbell' color={color} size={26} />),
                            headerShown: false
                        }}
                        listeners={{ tabPress: () => { updateExercisesEmitter() } }}
                    />
                    <Tab.Screen name='workoutStack'
                        children={() => <WorkoutStackScreen user={userInfo} />}
                        options={{
                            tabBarLabel: 'Workouts',
                            tabBarIcon: ({ color }) => (<MaterialCommunityIcons name='weight-lifter' color={color} size={26} />)
                        }}
                        listeners={{ tabPress: () => { updateWorkoutEmitter() } }} />
                </Tab.Navigator>

            ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ padding: 6 }}>Please sign in to store your workouts!</Text>
                    <Button title='Login' onPress={() => promptAsync({ useProxy: false, showInRecents: true })}
                    />
                </View>
            ))}</NavigationContainer>
    );
}
