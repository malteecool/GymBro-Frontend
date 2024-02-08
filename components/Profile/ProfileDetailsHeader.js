import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from "react-native";
import { getWorkoutsCount } from '../../services/StatsService';
import Styles from "../../Styles";

export function ProfileDetailsHeader({ user, numberOfTimes}) {

    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);

    const load = async () => {
        try {
            setLoading(true);
            const workoutCounts = await getWorkoutsCount(user);
            setData(workoutCounts);
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        console.log(numberOfTimes);
    }, [numberOfTimes]);

    return (
        <View style={Styles.container}>
            <TouchableOpacity style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
                marginTop: 10,
            }}
                disabled={true}>
                <Text style={{...Styles.oswaldBold}}>
                YOU'VE BEEN TO THE GYM 
                {!numberOfTimes ? (<ActivityIndicator size="large"/>) : (<Text style={{...Styles.oswaldBold, color: '#0C7C59'}}> {numberOfTimes[0].count} </Text>)}
                {numberOfTimes && (numberOfTimes[0].count > 1 || numberOfTimes[0].count == 0) ? ( <Text style={{...Styles.oswaldBold, color: '#0C7C59'}}>TIMES </Text>) : <Text style={{...Styles.oswaldBold, color: '#0C7C59'}}>TIME </Text>}
                THIS WEEK, KEEP GOING!
                </Text>
                </TouchableOpacity>
            
        </View>
    );

}



export default ProfileDetailsHeader;
