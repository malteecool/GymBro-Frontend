import React from "react";
import { View } from "react-native";
import { Card, Button, Title } from 'react-native-elements';
import Styles from "../Styles";

export function SplitScreen({ navigation, route }) {

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


    return (
        <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor }}>{
            days.map((day) => {
                return (
                    <Card containerStyle={Styles.card}>
                        <Card.Title>{day}</Card.Title>
                    </Card>
                );
            })
        }
        </View>
    )

}