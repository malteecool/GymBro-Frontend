import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { Button, Card } from 'react-native-elements';
import Carousel from "react-native-snap-carousel";
import { getReferenceWeek, convertToWeekData } from '../../services/SplitService.Service';
import { getWeekNumber } from '../../services/StatsService.Service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from "../../Styles";
import { LoadingIndicator } from '../Misc/LoadingIndicator.Misc';

export function SplitScreen({ navigation, route }) {

    const user = route.params.userInfo.user;
    const sliderWidth = Dimensions.get('window').width;
    let carouselRef = useRef(null);
    const [weekData, setWeekData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const currentWeek = getWeekNumber(new Date());
    const [currentWeekLabel, setCurrentWeekLabel] = useState('Week ' + currentWeek);


    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const referenceWeek = await getReferenceWeek(user.id);
            const allWeeks = convertToWeekData(referenceWeek);
            setWeekData(allWeeks);
            setLoading(false);
        }
        load();
    }, []);

    const _onSnapToItem = (index) => {
        if (index > 0) {
            setCurrentWeekLabel('Week ' + (currentWeek + (index - 1)));
        } else {
            setCurrentWeekLabel('Reference week');
        }
    }

    const _renderItem = ({ item, index }) => {
        if (index == 0) {
            return (
                <View style={{ flex: 1, backgroundColor: '#123123' }}>
                    <Text>This is your reference week. All the following weeks are based on this.</Text>
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                {
                    Object.keys(item).map((day, i) => {
                        return (
                            <TouchableOpacity key={i}>
                                <Card containerStyle={Styles.smallCard}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignContent: 'center', width: '100%' }}>
                                        <Text style={{ marginHorizontal: 0, ...Styles.detailText, fontWeight: 'bold', width: '50%', textAlign: 'center' }}>{day}</Text>
                                        <Text style={{ marginHorizontal: 0, ...Styles.detailText, fontWeight: 'bold', width: '50%', textAlign: 'center' }}>{item[day].workout.wor_name}</Text>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        );
    };

    if (isLoading) {
        return (
            <LoadingIndicator text={'Loading split...'} />
        )
    }

    if (!weekData) {
        return (
            <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor, justifyContent: 'center', alignContent: 'center' }}>
                <Button onPress={() => { navigation.navigate('addSplit', { userId: user.id }) }}
                    buttonStyle={{ ...Styles.green, alignSelf: 'center' }} title={'Create your split'} />
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor }}>
            <View style={{ flex: 1 }}>
                <View style={{ height: 60, flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', backgroundColor: Styles.lessDark.backgroundColor }}>
                    <TouchableOpacity onPress={() => carouselRef.snapToPrev()} style={{ justifyContent: 'center', alignContent: 'center' }}><MaterialCommunityIcons style={Styles.fontColor} name='chevron-left' size={50} /></TouchableOpacity>
                    <Text style={{ ...Styles.headerTitle, marginTop: 8, fontWeight: 'bold' }}>{currentWeekLabel}</Text>
                    <TouchableOpacity onPress={() => carouselRef.snapToNext()} style={{ justifyContent: 'center', alignContent: 'center' }}><MaterialCommunityIcons style={Styles.fontColor} name='chevron-right' size={50} /></TouchableOpacity>
                </View>
                <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor }}>{
                    <Carousel
                        ref={(c) => { carouselRef = c }}
                        data={weekData}
                        renderItem={_renderItem}
                        sliderWidth={sliderWidth}
                        itemWidth={sliderWidth}
                        firstItem={1}
                        onSnapToItem={_onSnapToItem}
                    >
                    </Carousel>
                }</View>
            </View>
        </View>
    )
}