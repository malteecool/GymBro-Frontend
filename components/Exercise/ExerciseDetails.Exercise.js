import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Button, Divider } from 'react-native-elements'
import emitter from '../Custom/CustomEventEmitter.Custom';
import { getHistory, getFirebaseTimeStamp } from '../../services/ExerciseService.Service'
import Styles from '../../Styles';
import { LoadingIndicator } from '../Misc/LoadingIndicator.Misc';


const LABEL_WEIGHT = "WEIGHT";
const LABEL_REPS = "REPS"

export function ExerciseDetails({ navigation, route }) {

    const exercise = route.params.exercise;
    const exerciseId = exercise.id;
    const [isLoading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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

    useEffect(() => {
        const listener = (data) => {
            load();
        };
        emitter.on('setEvent', listener);

        return () => {
            emitter.off('setEvent', listener);
        }

    }, []);

    const _onRefresh = React.useCallback(() => {
        load();
    }, []);

    if (isLoading) {
        return (
            <LoadingIndicator text={''} />
        )
    }

    if (isEmpty) {
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={Styles.fontColor}>No sets yet</Text>
        </View>
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Styles.dark.backgroundColor }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <ScrollView style={{ width: '100%' }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_onRefresh} />}
                >{
                        data.map((exercise, i) => (
                            <Card key={i} containerStyle={{
                                ...Styles.card,
                                paddingHorizontal: 0,
                                paddingBottom: 0,
                                borderWidth: 1,
                                backgroundColor: Styles.green.backgroundColor,
                                borderColor: Styles.lessDark.backgroundColor
                            }}>
                                <Card.Title style={{
                                    ...Styles.cardTitle,
                                    color: '#E5E3D4',
                                    alignSelf: 'flex-start',
                                    paddingHorizontal: 16,
                                    fontSize: 25,
                                    backgroundColor: Styles.green.backgroundColor,
                                    marginLeft: 0
                                }}>
                                    <Text style={{ fontSize: 30 }}>{getFirebaseTimeStamp(exercise.exh_date.seconds, exercise.exh_date.nanoseconds).toDateString()}</Text>
                                </Card.Title>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingBottom: 5, }}>
                                    <Text style={{ marginHorizontal: 0, ...Styles.detailText, fontWeight: 'bold', width: '50%', textAlign: 'center' }}>{LABEL_WEIGHT}</Text>
                                    <Text style={{ marginHorizontal: 0, ...Styles.detailText, fontWeight: 'bold', width: '50%', textAlign: 'center' }}>{LABEL_REPS}</Text>
                                </View>
                                {
                                    (exercise.exh_sets !== null && exercise.exh_sets !== undefined) &&
                                    exercise.exh_sets.map((set, i) => {
                                        return (
                                            <View key={i} style={{ backgroundColor: Styles.fontColor.color }}>
                                                <Divider width={1} color={Styles.lessDark.backgroundColor} />
                                                <View style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-evenly',

                                                }}>
                                                    <Text style={{ ...Styles.detailText, color: Styles.dark.backgroundColor, width: '50%', borderRightWidth: 1, borderColor: Styles.lessDark.backgroundColor, textAlign: 'center' }}>{set.set_weight}</Text>
                                                    <Text style={{ ...Styles.detailText, color: Styles.dark.backgroundColor, width: '50%', textAlign: 'center' }}>{set.set_reps}</Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </Card>
                        ))
                    }
                </ScrollView>
            </View>


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



