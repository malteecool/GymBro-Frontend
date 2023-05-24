import React, { Component, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-elements';

export function Card2({ historyId, childToParent }) {
    const [sets, setSets] = useState([{ set_weight: 0, set_reps: 0 }]);

    useEffect(() => {
        childToParent(sets);
    });

    const onAddSet = () => {
        setSets([...sets, { set_weight: 0, set_reps: 0 }])
        childToParent(sets);
    };

    return (
        <View>
            <Card containerStyle={{ padding: 0, borderRadius: 6, borderBottomWidth: 2, borderRightWidth: 2 }}>
                {
                    sets.map((set, i) => {
                        return (
                            <View key={i}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                    <Text style={{ marginStart: 0, padding: 10 }}>{i + 1}</Text>

                                    <TextInput onChangeText={value => set.set_weight = parseInt(value)}
                                        style={{ padding: 5, marginStart: 20, width: '33%', textAlign: 'right' }}
                                        placeholder={String(set.set_weight)}
                                    />

                                    <Text style={{ paddingHorizontal: 0 }}>kg</Text>

                                    <TextInput onChangeText={value => set.set_reps = parseInt(value)}
                                        style={{ padding: 5, marginStart: 20, width: '33%', textAlign: 'right' }}
                                        placeholder={String(set.set_reps)}
                                    />

                                    <Text style={{ paddingHorizontal: 0 }}>reps</Text>
                                </View>
                                <Card.Divider style={{ width: '100%', padding: 0, marginBottom: 0 }} />
                            </View>
                        )
                    })
                }
                <TouchableOpacity style={{ backgroundColor: 'primary', padding: 10 }} onPress={onAddSet}><Text>Add set</Text></TouchableOpacity>
            </Card>
        </View>
    )
}

