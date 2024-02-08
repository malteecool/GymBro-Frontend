import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { Card, Button, Title } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Carousel from "react-native-snap-carousel";
import { getReferenceWeek } from '../../services/SplitService';
import Styles from "../../Styles";
import {
    Menu,
    MenuProvider,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

export function SplitScreen({ navigation, route }) {

    const user = route.params.userInfo.user;

    const [activeIndex, setActiveIndex] = useState(0);
    const sliderWidth = Dimensions.get('window').width;
    let carouselRef = useRef(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeks = [days, days, days];
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const referenceWeek = await getReferenceWeek(user.id);
            console.log(referenceWeek);
            if (referenceWeek) {
                setData(referenceWeek);
            }
            setLoading(false);
        }
        load();
    }, []);
    /**
     * 
     */

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Styles.dark.backgroundColor }}>{
            isLoading ? (
                <View style={Styles.activityIndicator}>
                    <ActivityIndicator />
                    <Text style={Styles.fontColor}>Loading split...</Text>
                </View>
            ) : (
                data ? (
                    <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor, justifyContent: 'center', alignContent: 'center' }}>
                        <Button onPress={() => { navigation.navigate('addSplit', { userId: user.id }) }}
                            buttonStyle={{ ...Styles.green, alignSelf: 'center' }} title={'Create your split'} />
                    </View>
                ) : (
                    <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor }}>
                        <Text>Test</Text>
                    </View>
                )
            )
        }</View>
    )

}