import { View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Button } from 'react-native-elements';
import { ActivityIndicator } from 'react-native-paper';
import { Card2 } from './customCard';
import emitter from './customEventEmitter';
import { postExercise } from '../services/SetService';

export function AddSet({ navigation, route }) {

    const exercise = route.params.exercise;
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    
    const childToParent = (childData) => {
        setData(childData);
    }

    const onAddHistory = async () => {
        try {
            setLoading(true);
            await postExercise(exercise, data)
        }
        
        catch (error) {
            console.log(error);
        }
        finally {
            emitter.emit('setEvent', 0);
            emitter.emit('workoutEvent', 0);
            setLoading(false);
            navigation.goBack();
        }
    }

    return (
        <View style={{ flex:1 }}>{
            isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <View style={{flex:1}}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                        <Card2 historyId={exercise.id} childToParent={childToParent} />
                    </ScrollView>
                    <View style={{ position: 'absolute', width: '100%', bottom: 0 }}>
                        <Button title='Complete' onPress={onAddHistory} buttonStyle={{ margin: 10, height: 40 }} />
                    </View>
                </View>
            )
        }</View>
    )
}
