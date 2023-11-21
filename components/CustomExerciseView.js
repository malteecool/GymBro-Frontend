import React, { useEffect, useState } from "react";
import { getExercises } from "../services/ExerciseService";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-elements";

export function CustomExerciseView({ userid, childToParent }) {
    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState([]);

    useEffect(() => {
        const getAvailableExericses = async () => {
            setLoading(true);
            setData(await getExercises(userid));
            console.log(data);
            setLoading(false);
        }
        getAvailableExericses();
    }, []);

    // introduces alot of rerenders on the view but fixes the problem with not all elements in the array gets passed to the parent.
    useEffect(() => {
        childToParent(selectedExercises);
    });

    const addSelectedExercise = (id) => {
        if (!selectedExercises.includes(id)) {
            setSelectedExercises(selectedExercises => [...selectedExercises, id]);
        } else {
            setSelectedExercises(selectedExercises.filter(item => item !== id));
        }
        childToParent(selectedExercises);
    }

    const selectedStyle = StyleSheet.create({
        active: { backgroundColor: '#4caf50' },
        inactive: { backgroundColor: 'white' }
    });

    return (
        <View style={{ flex: 1 }}>
            {
                isLoading ? <ActivityIndicator /> :
                    (
                        <ScrollView>
                            {
                                data.map((item, i) => {
                                    return (<View>
                                        <TouchableOpacity onPress={() => { addSelectedExercise(item.id) }}>
                                            <Card key={i} containerStyle={[{ padding: 15, borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 },
                                            selectedExercises.includes(item.id) ? selectedStyle.active : selectedStyle.inactive]}>
                                                <Text>{item.exe_name}</Text>
                                            </Card>
                                        </TouchableOpacity>
                                    </View>)
                                })
                            }
                        </ScrollView>
                    )
            }
        </View>
    )
}

export default CustomExerciseView;