import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const CounterComponent = ({ targetValue }) => {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        const incrementCounter = () => {
            setCounter(prevCounter => prevCounter + 1);
        };

        const intervalDuration = 1000 / Math.sqrt(counter + 100);

        if (counter < targetValue) {
            const timerId = setInterval(incrementCounter, intervalDuration);
            return () => clearInterval(timerId);
        }
    }, [counter]);

    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
            marginTop: -20
        }}>
            <Text style={{
                fontSize: 60,
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#3498db',
            }}>{counter}</Text>
        </View>
    );
};

export default CounterComponent;