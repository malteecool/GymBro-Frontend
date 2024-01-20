import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BarGraph = ({ data, labels }) => {

    const renderBars = () => {
        return data.map((item, index) => (
            <View key={index} style={styles.barContainer}>
                <Text style={styles.label}>{labels && labels[index]}</Text>
                <View style={[styles.bar, { height: item * 20 }]}>
                    <Text style={styles.barText}>{item}</Text>
                </View>
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            <View style={styles.chart}>
                {
                    renderBars()
                }
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    chart: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column-reverse'
    },
    bar: {
        backgroundColor: '#3498db',
        marginHorizontal: 2,
        width: 50,
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'column-reverse',
    },
    barText: {
        color: 'white',
        marginBottom: 5,
    },
    label: {
        marginBottom: 5,
        color: '#2c3e50',
        fontWeight: 'bold'
    },
});


export default BarGraph;