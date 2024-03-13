import { Text, View, ActivityIndicator, StatusBar, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, transitionSpec } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-elements';
import { ExerciseDetails } from './components/Exercise/ExerciseDetails.Exercise';
import { AddExercise } from './components/Exercise/AddExercise.Exercise';
import { AddSet } from './components/Exercise/AddSet.Exercise';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
//import { AsyncStorage } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import { ExcerciseScreen } from './components/Exercise/ExerciseScreen.Exercise';
import { WorkoutScreen } from './components/Workout/WorkoutScreen.Workout';
import { WorkoutDetails } from './components/Workout/WorkoutDetails.Workout';
import { ProfileScreen } from './components/Profile/ProfileScreen.Profile';
import { SplitScreen } from './components/Split/SplitScreen.Split';
import emitter from "./components/Custom/CustomEventEmitter.Custom";
import { AddWorkout } from './components/Workout/AddWorkout.Workout';
import { getUserData } from './services/UserService.Service';
import Styles from './Styles';
import { AddSplit } from './components/Split/AddSplit.Split';
import { MenuProvider } from 'react-native-popup-menu';
import { LoadingIndicator } from './components/Misc/LoadingIndicator.Misc';

WebBrowser.maybeCompleteAuthSession();

const Stack = createNativeStackNavigator();

function ExerciseStackScreen(userInfo) {

    const config = {
        animation: 'timing',
        config: {
            duration: 1000,
            easing: 1000
        },
    };

    return (
        <Stack.Navigator>
            <Stack.Screen name='excercises'
                component={ExcerciseScreen}
                initialParams={{ userInfo: userInfo }}
                options={{
                    headerShown: false
                }} />
            <Stack.Screen name='exerciseDetails' component={ExerciseDetails} options={({ route }) => ({
                title: route.params.exercise.exe_name,
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color,
                transitionSpec: {
                    open: config,
                    close: config,
                },
            })} />
            <Stack.Screen name='addExercise' component={AddExercise} options={({ route }) => ({
                title: 'New exercise',
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color,
                transitionSpec: {
                    open: config,
                    close: config,
                }
            })} />
            <Stack.Screen name='addSet' component={AddSet} options={({ route }) => ({
                title: route.params.exercise.exe_name,
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color,
                transitionSpec: {
                    open: config,
                    close: config,
                }
            })} />
        </Stack.Navigator>
    )
}

function WorkoutStackScreen(userInfo) {
    return (
        <Stack.Navigator>
            <Stack.Screen name='workouts' component={WorkoutScreen} initialParams={{ userInfo: userInfo }} options={{ headerShown: false }} />
            <Stack.Screen name='workoutDetails' component={WorkoutDetails} options={({ route }) => ({
                title: route.params.workout.wor_name,
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color
            })} />
            <Stack.Screen name='exerciseDetailsWorkout' component={ExerciseDetails} options={({ route }) => ({
                title: route.params.exercise.exe_name,
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color
            })} />
            <Stack.Screen name='addExercise' component={AddExercise} options={({ route }) => ({
                title: 'New exercise',
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color
            })} />
            <Stack.Screen name='addSet' component={AddSet} options={({ route }) => ({
                title: route.params.exercise.exe_name,
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color
            })} />
            <Stack.Screen name='addWorkout' component={AddWorkout} options={({ route }) => ({
                title: 'New workout',
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color
            })} />
        </Stack.Navigator>
    )
}

function ProfileStackScreen(userInfo) {
    return (
        <Stack.Navigator headerMode>
            <Stack.Screen name='profile' component={ProfileScreen} initialParams={{ userInfo: userInfo }} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

function SplitStackScreen(userInfo) {
    return (
        <Stack.Navigator>
            <Stack.Screen name='split' component={SplitScreen} initialParams={{ userInfo: userInfo }} options={{ headerShown: false }} />
            <Stack.Screen name='addSplit' component={AddSplit} options={({ route }) => ({
                title: 'New workout split',
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color
            })} />
            <Stack.Screen name='workoutDetailsSplit' component={WorkoutDetails} options={({ route }) => ({
                title: route.params.workout.wor_name,
                headerStyle: Styles.lessDark,
                headerTitleStyle: Styles.fontColor,
                headerTintColor: Styles.fontColor.color
            })} />
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
            //store user session so we do not need to login every time we enter the app.
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
                    setUserInfo(userData);
                } else if (userData.error?.code == 401) {
                    console.log("refreshing token");
                    const clientId = process.env.REACT_APP_TOKEN;
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
                    if (userData) {
                        setUserInfo(userData);
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

    const menuProviderStyles = {
        backdrop: Styles.menuBackdrop
    }

    if (isLoading) {
        return (
            <LoadingIndicator text={'Logging in...'} />
        )

    }

    if (!auth || !userInfo) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Styles.dark.backgroundColor }}>
                <Text style={{ padding: 6 }}>Please sign in to store your workouts!</Text>
                <Button title='Login' onPress={() => promptAsync({ useProxy: false, showInRecents: true })}
                />
            </View>
        )
    }

    return (
        <View style={{
            flex: 1,
            paddingTop: StatusBar.currentHeight || 0,
            backgroundColor: Styles.lessDark.backgroundColor
        }}>
            <StatusBar
                backgroundColor="transparent"
                barStyle="light-content"
                translucent={true}
            >
            </StatusBar>
            <MenuProvider customStyles={menuProviderStyles}>
                <NavigationContainer>
                    <Tab.Navigator
                        style={{ flex: 1 }}
                        activeColor='#000'
                        inactiveColor='#CDCD55'
                        tabBarLabelStyle={{ color: '#CDCD55' }}
                        barStyle={Styles.lessDark}>
                        <Tab.Screen name='profileStack'
                            children={() => <ProfileStackScreen user={userInfo} />}
                            options={{
                                tabBarLabel: <Text style={{ color: '#CDCD55' }}>Profile</Text>,
                                tabBarIcon: ({ color }) => (<MaterialCommunityIcons name='account' color={color} size={26} />)
                            }}
                            listeners={{ tabPress: () => { updateProfileEmitter() } }} />
                        <Tab.Screen name='exerciseStack'
                            children={() => <ExerciseStackScreen user={userInfo} />}
                            options={{
                                tabBarLabel: <Text style={{ color: '#CDCD55' }}>Exercises</Text>,
                                tabBarIcon: ({ color }) => (<MaterialCommunityIcons name='dumbbell' color={color} size={26} />),
                                headerShown: false
                            }}
                            listeners={{ tabPress: () => { updateExercisesEmitter() } }}
                        />
                        <Tab.Screen name='workoutStack'
                            children={() => <WorkoutStackScreen user={userInfo} />}
                            options={{
                                tabBarLabel: <Text style={{ color: '#CDCD55' }}>Workouts</Text>,
                                tabBarIcon: ({ color }) => (<MaterialCommunityIcons name='weight-lifter' color={color} size={26} />)
                            }}
                            listeners={{ tabPress: () => { updateWorkoutEmitter() } }} />
                        <Tab.Screen name='splitStack'
                            children={() => <SplitStackScreen user={userInfo} />}
                            options={{
                                tabBarLabel: <Text style={{ color: '#CDCD55' }}>Split</Text>,
                                tabBarIcon: ({ color }) => (<MaterialCommunityIcons name='calendar' color={color} size={26} />)
                            }}
                        />
                    </Tab.Navigator>
                </NavigationContainer>
            </MenuProvider>
        </View>

    );
}
