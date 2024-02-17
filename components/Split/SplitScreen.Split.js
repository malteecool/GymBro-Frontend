import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView, RefreshControl } from "react-native";
import { Button, Card } from 'react-native-elements';
import Carousel from "react-native-snap-carousel";
import { getReferenceWeek, convertToWeekData } from '../../services/SplitService.Service';
import { getWeekNumber } from '../../services/StatsService.Service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from "../../Styles";
import { LoadingIndicator } from '../Misc/LoadingIndicator.Misc';
import emitter from "../Custom/CustomEventEmitter.Custom";

/**
 * 
 * @TODO    Optimization is needed for this component in 
 *          order to effectively render and update the list
 *          which gets quite large. Currently its strictly 
 *          set to 5 weeks but if a larger value is wanted
 *          the list handling could be switched to useMemo (possibly)
 *  
 */
export function SplitScreen({ navigation, route }) {

    const user = route.params.userInfo.user;
    const sliderWidth = Dimensions.get('window').width;
    let carouselRef = useRef(null);
    const [weekData, setWeekData] = useState(null);
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const currentWeek = getWeekNumber(new Date());
    const [currentWeekLabel, setCurrentWeekLabel] = useState('Week ' + currentWeek);

    const load = async () => {
        setLoading(true);
        const data = await getReferenceWeek(user.id);
        setData(data);
        setWeekData(data.weeks);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        const listener = (data) => {
            load();
        };
        emitter.on('splitEvent', listener);

        return () => {
            emitter.off('splitEvent', listener);
        }

    }, []);

    const _onSnapToItem = (index) => {
        if (index > 0) {
            setCurrentWeekLabel('Week ' + (currentWeek + (index - 1)));
        } else {
            setCurrentWeekLabel('Reference week');
        }
    }

    const _onRefresh = React.useCallback(() => {
        load();
    }, []);

    const markAsCompleted = (week, day) => {
        setLoading(true);
        weekData[week][day].completed = !weekData[week][day].completed;
        const updatedWeekData = weekData.map(item => ({ ...item }));
        setWeekData(updatedWeekData);
        setLoading(false);
    }

    const _renderItem = ({ item, index }) => {
        if (index == 0) {
            return (
                <View key={index} style={{ flex: 1 }}>
                    <Text style={{fontSize: 20, justifyContent: 'center', textAlign:'center', color: Styles.fontColor.color}}>This is your reference week. All the following weeks are based on this.</Text>
                    <View style={{ flex: 1, backgroundColor: Styles.dark.backgroundColor, justifyContent: 'center', alignContent: 'center' }}>
                        <Button onPress={() => { navigation.navigate('addSplit', { userId: user.id }) }}
                            buttonStyle={{ ...Styles.green, alignSelf: 'center' }} title={'Create your split'} />
                    </View>
                </View>
            );
        }

        return (
            <View key={item.id} style={{ flex: 1 }}>
                {
                    <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 15 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={_onRefresh} />
                        }
                    >{
                            Object.keys(item).map((day, i) => (
                                    <TouchableOpacity key={item.id} onPress={() => { navigation.navigate('workoutDetailsSplit', { workout: item[day].workout }) }}>
                                        <Card containerStyle={[Styles.card, item[day].completed ? Styles.green : null]}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View>
                                                    <Text style={Styles.cardTitle}>
                                                        <MaterialCommunityIcons style={Styles.icon} name='calendar' size={22} />
                                                        {' ' + day}
                                                    </Text>
                                                    <Text style={{ ...Styles.fontColor, fontSize: 18, marginLeft: 10 }}>
                                                        <MaterialCommunityIcons style={Styles.icon} name='weight-lifter' size={22} />
                                                        {' ' + item[day].workout.wor_name}
                                                    </Text>
                                                </View>
                                                <View style={{ justifyContent: 'center', alignContent: 'center', marginRight: 10 }}>
                                                    <TouchableOpacity style={{ padding: 10 }} onPress={() => markAsCompleted(index, day)}>
                                                        {
                                                            !item[day].completed ? 
                                                            (<MaterialCommunityIcons style={Styles.icon} name="check" size={35} />) : 
                                                            (<MaterialCommunityIcons style={Styles.icon} name="window-close" size={35} />)
                                                        }
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </Card>
                                    </TouchableOpacity>
                                )
                            )
                        }</ScrollView>
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