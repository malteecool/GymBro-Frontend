import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { getWorkoutsCount } from '../services/StatsService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export function ProfileDetailsHeader({ user }) {

    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            height: 250,
            marginBottom: 10,
            backgroundColor: '#3498db',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            marginLeft: 5,
            marginRight: 5,
            elevation: 5,
        },
        button: {
            flex: 1,
            height: 80,
            borderRadius: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#2980b9',
        },
        buttonText: {
            color: 'white',
            fontSize: 16,
        },
        profileImage: {
            width: 50,
            height: 50,
            borderRadius: 25,
            margin: 5,
        },
    });

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

    return (
        <View style={styles.container}>
            <TouchableOpacity style={{ ...styles.button, marginRight: 10 }}>
                <MaterialCommunityIcons
                    name='bell'
                    size={30}
                    color='#ecf0f1'
                />
            </TouchableOpacity>
            <TouchableOpacity style={{
                flex: 1,
                height: 120,
                borderRadius: 60,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
                backgroundColor: '#2ecc71',
            }}
                disabled={true}>
                <Image
                    source={{ uri: user.picture }}
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                    }}
                />
            </TouchableOpacity>
            <TouchableOpacity style={{ ...styles.button, marginLeft: 10 }}>
                <MaterialCommunityIcons
                    name='cog'
                    size={30}
                    color='#ecf0f1'
                />
            </TouchableOpacity>
        </View>
    );

}

export default ProfileDetailsHeader;
