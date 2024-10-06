import { View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Button } from 'react-native-elements';
import { Card2 } from '../Custom/CustomCard.Custom';
import emitter from '../Custom/CustomEventEmitter.Custom';
import { addExerciseHistory } from '../../services/SetService.Service';
import Styles from '../../Styles';
import { LoadingIndicator } from '../Misc/LoadingIndicator.Misc';

export function AddSet({ navigation, route }) {

    const exercise = route.params.exercise;
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState([]);


    // Used to handle updates to this component from child components.
    const parentCallback = (childData) => {
        console.log(childData);
        setData(childData);
    }

    const onAddHistory = async () => {
        try {
            setLoading(true);
            await addExerciseHistory(exercise, data)
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

    if (isLoading) {
        return (
            <LoadingIndicator text={''} />
        )
    }

    return (
        <View style={{ flex: 1, ...Styles.dark }}>
            <View style={{ flex: 1, }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                    <Card2 historyId={exercise.id} parentCallback={parentCallback} />
                </ScrollView>
                <View style={{ position: 'absolute', width: '100%', bottom: 0 }}>
                    <Button title='Complete' onPress={onAddHistory} buttonStyle={{ margin: 10, height: 40 }} />
                </View>
            </View>
        </View>
    )
}
