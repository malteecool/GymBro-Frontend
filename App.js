import { Text, View, ActivityIndicator } from 'react-native';
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
import { ExcerciseScreen } from './components/ExerciseScreen';
import { WorkoutScreen } from './components/WorkoutScreen';
import { WorkoutDetails } from './components/WorkoutDetails';
import { ProfileScreen } from './components/ProfileScreen';
import emitter from "./components/customEventEmitter";
import { AddWorkout } from './components/AddWorkout';
import { getClientId, userExist, getUserData, addUser, logout } from './services/UserService';

WebBrowser.maybeCompleteAuthSession();

const Stack = createNativeStackNavigator();

function ExerciseStackScreen(userInfo) {
    return (
        <Stack.Navigator>
            <Stack.Screen name='excercises'
                component={ExcerciseScreen}
                initialParams={{ userInfo: userInfo }}
                options={{ headerShown: false }} />
            <Stack.Screen name='exerciseDetails' component={ExerciseDetails} options={({ route }) => ({ title: route.params.exercise.exe_name })} />
            <Stack.Screen name='addExercise' component={AddExercise} options={({ route }) => ({ title: 'New exercise' })} />
            <Stack.Screen name='addSet' component={AddSet} options={({ route }) => ({ title: route.params.exercise.exe_name })} />
        </Stack.Navigator>
    )
}

function WorkoutStackScreen(userInfo) {
    return (
        <Stack.Navigator>
            <Stack.Screen name='workouts' component={WorkoutScreen} initialParams={{ userInfo: userInfo }} options={{ headerShown: false }} />
            <Stack.Screen name='workoutDetails' component={WorkoutDetails} options={({ route }) => ({ title: route.params.workout.wor_name })} />
            <Stack.Screen name='exerciseDetailsWorkout' component={ExerciseDetails} options={({ route }) => ({ title: route.params.exercise.exe_name })} />
            <Stack.Screen name='addExercise' component={AddExercise} options={({ route }) => ({ title: 'New exercise' })} />
            <Stack.Screen name='addSet' component={AddSet} options={({ route }) => ({ title: route.params.exercise.exe_name })} />
            <Stack.Screen name='addWorkout' component={AddWorkout} options={({ route }) => ({ title: 'New workout' })} />
        </Stack.Navigator>
    )
}

function ProfileStackScreen(userInfo) {
    return (
        <Stack.Navigator>
            <Stack.Screen name='profile' component={ProfileScreen} initialParams={{ userInfo: userInfo }} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const Tab = createMaterialBottomTabNavigator();


const updateExercisesEmitter = () => {
    emitter.emit('exerciseEvent', 0);
}

const updateWorkoutEmitter = () => {
    emitter.emit('workoutEvent', 0);
}

const updateProfileEmitter = () => {
    emitter.emit('profileEvent', 0);
}

// handles login
export default function App() {
    const [userInfo, setUserInfo] = useState();
    const [auth, setAuth] = useState();
    const [requireRefresh, setRequireRefresh] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.REACT_APP_TOKEN,
    });

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
                    if (dbUser == null) {
                        // could probably be removed, not needed.
                        const newUser = await addUser(userData);
                    }
                    setUserInfo(userData);
                } else if (userData.error?.code == 401) {
                    console.log("refreshing token")
                    const clientId = getClientId();
                    console.log(clientId);
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

    return (
        <NavigationContainer>{
            isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                    <Text>Logging in...</Text>
                </View>
            ) : ((auth && userInfo) ? (
                <Tab.Navigator
                    activeColor='#000'
                    inactiveColor='#fff'
                    barStyle={{ backgroundColor: '#2289dc' }}>
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
                    <Tab.Screen name='profileStack'
                        children={() => <ProfileStackScreen user={userInfo} />}
                        options={{
                            tabBarLabel: 'Profile',
                            tabBarIcon: ({ color }) => (<MaterialCommunityIcons name='account' color={color} size={26} />)
                        }}
                        listeners={{ tabPress: () => { updateProfileEmitter() } }} />
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
