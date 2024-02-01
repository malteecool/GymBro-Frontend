import React, { useEffect, useState } from "react";
import { getExercises } from "../services/ExerciseService";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-elements";
import Styles from "../Styles";

export function CustomExerciseView({ userid, childToParent }) {
    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState([]);

    useEffect(() => {
        const getAvailableExericses = async () => {
            setLoading(true);
            const fetchedData = await getExercises(userid)
            setData(fetchedData);
            setLoading(false);
        }
        getAvailableExericses();
    }, []);

    // introduces alot of rerenders on the view but fixes the problem with not all elements in the array gets passed to the parent.
    useEffect(() => {
        childToParent(selectedExercises);
    });

    let start = 0;

    const addSelectedExercise = (id) => {
        if (!selectedExercises.map(x => x.id).includes(id)) {
            setSelectedExercises(selectedExercises => [...selectedExercises, { id: id, ordinal: selectedExercises.length }]);
            start = start + 1;
        } else {
            setSelectedExercises(selectedExercises.filter(item => item["id"] !== id));
        }
    }

    const selectedStyle = StyleSheet.create({
        active: { backgroundColor: '#0C7C59' },
        inactive: { backgroundColor: '#1c1a1a' }
    });

    return (
        <View style={{ flex: 1 }}>
            {
                isLoading ? <ActivityIndicator style={Styles.activityIndicator} /> :
                    (
                        <ScrollView contentContainerStyle={{ paddingBottom: 75, backgroundColor: Styles.dark.backgroundColor, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                            {
                                data.map((item, i) => {
                                    return (<View key={i}>
                                        <TouchableOpacity onPress={() => { addSelectedExercise(item.id) }}>
                                            <Card key={i} containerStyle={[Styles.smallCard,
                                            selectedExercises.map(x => x.id).includes(item.id) ? selectedStyle.active : selectedStyle.inactive]}>
                                                <Text style={{ ...Styles.detailText, margin: 0 }}>{item.exe_name}</Text>
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