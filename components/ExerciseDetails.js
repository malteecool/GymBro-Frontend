import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Card, Button, Divider } from 'react-native-elements'
import { ActivityIndicator } from 'react-native-paper';
import emitter from './customEventEmitter';
import { getHistory, getFirebaseTimeStamp } from '../services/ExerciseService'
import Styles from '../Styles';


const LABEL_WEIGHT = "WEIGHT";
const LABEL_REPS = "REPS"

export function ExerciseDetails({ navigation, route }) {

    const exercise = route.params.exercise;
    const exerciseId = exercise.id;
    const [isLoading, setLoading] = useState(true);
    const [isEmpty, setEmpty] = useState(true);
    const [data, setData] = useState([]);

    const load = async () => {
        try {
            setLoading(true);
            const history = await getHistory(exerciseId);
            setData(history);
            setLoading(false);
            setEmpty(history.length == 0);
        }
        catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        load();
    }, []);

    React.useEffect(() => {
        const listener = (data) => {
            load();
        };
        emitter.on('setEvent', listener);

        return () => {
            emitter.off('setEvent', listener);
        }

    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Styles.dark.backgroundColor }}>
            {isLoading ? (
                <View style={Styles.activityIndicator}>
                    <ActivityIndicator />
                </View>
            ) : (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>

                {!isEmpty ? (
                    <ScrollView style={{ width: '100%' }}>{
                        data.map((exercise, i) => (
                            <Card key={i} containerStyle={{ ...Styles.card, paddingHorizontal: 0, paddingBottom: 0 }}>
                                <Card.Title style={{ ...Styles.cardTitle, color: '#E5E3D4', alignSelf: 'flex-start', paddingHorizontal: 16, fontSize: 25, backgroundColor: '#0C7C59', marginLeft: 0}}><Text style={{ fontSize: 30 }}>{getFirebaseTimeStamp(exercise.exh_date.seconds, exercise.exh_date.nanoseconds).toDateString()}</Text></Card.Title>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingBottom: 5, }}>
                                    <Text style={{ marginHorizontal: 0, ...Styles.detailText, fontWeight: 'bold' }}>{LABEL_WEIGHT}</Text>
                                    <Text style={{ marginHorizontal: 0, ...Styles.detailText, fontWeight: 'bold' }}>{LABEL_REPS}</Text>
                                </View>
                                {
                                    (exercise.exh_sets !== null && exercise.exh_sets !== undefined) &&
                                    exercise.exh_sets.map((set, i) => {
                                        return (
                                            <View key={i} >
                                                <Divider color={Styles.yellow.backgroundColor} style={{ marginHorizontal: 15 }} />
                                                <View style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-evenly',
                                                    paddingVertical: 8,
                                                }}>
                                                    <Text style={{ ...Styles.detailText }}>{set.set_weight}</Text>
                                                    <Text style={{ ...Styles.detailText, textAlign: 'center' }}>{set.set_reps}</Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </Card>
                        ))
                    }
                    </ScrollView>
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={Styles.fontColor}>No sets yet</Text>
                    </View>
                )}
            </View>

            )}
            <TouchableOpacity style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
            }}>
                <Button onPress={() => { navigation.navigate('addSet', { exercise: exercise }) }} title='+' titleStyle={{ fontSize: 24 }} buttonStyle={{ width: 60, height: 60, borderRadius: 30, borderColor: '#1c7bc7', backgroundColor: Styles.green.backgroundColor }} />
            </TouchableOpacity>
        </View>
    );
}



