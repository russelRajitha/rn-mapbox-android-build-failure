import React, {useState} from 'react';
import Animated, {useAnimatedStyle, useSharedValue,} from 'react-native-reanimated';
import {Gesture, GestureDetector, GestureHandlerRootView,} from 'react-native-gesture-handler';
import {Image, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";

function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
}

const image = require('./assets/img.png')
const MaxScale = 2.5
const MinScale = 1

export default function App() {
    const [containerDimensions, setContainerDimensions] = useState<{ width?: number; height?: number; }>({
        width: undefined,
        height: undefined,
    })
    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const prevTranslationX = useSharedValue(0);
    const prevTranslationY = useSharedValue(0);

    const scale = useSharedValue(MinScale);
    const savedScale = useSharedValue(MinScale);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [
            {translateX: translationX.value},
            {translateY: translationY.value},
            {scale: scale.value}
        ],
    }));

    const pinch = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = clamp(savedScale.value * e.scale, MinScale, MaxScale,);
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        }).runOnJS(true);

    const doubleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(2)
        .onStart(() => {
            if (scale.value > MinScale) {
                scale.value = MinScale;
                savedScale.value = MinScale;
            } else {
                scale.value = MaxScale;
                savedScale.value = MaxScale;
            }
        });

    const pan = Gesture.Pan()
        .minDistance(MinScale)
        .onStart(() => {
            prevTranslationX.value = translationX.value;
            prevTranslationY.value = translationY.value;
        })
        .onUpdate((event) => {
            const width = containerDimensions.width || 0;
            const height = containerDimensions.height || 0;

            const maxTranslateX = (width * (scale.value - MinScale)) / 2;
            const maxTranslateY = (height * (scale.value - MinScale)) / 2;

            const nextX = prevTranslationX.value + event.translationX;
            const nextY = prevTranslationY.value + event.translationY;

            translationX.value = clamp(nextX, -maxTranslateX, maxTranslateX);
            translationY.value = clamp(nextY, -maxTranslateY, maxTranslateY);
        })
        .runOnJS(true);
    const composed = Gesture.Race(pan, pinch, doubleTap);
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{flex: 1}}>
                <View
                    style={{flex: 1, backgroundColor: 'red', overflow: 'hidden'}}
                    onLayout={(event) => setContainerDimensions({
                        width: event.nativeEvent.layout.width,
                        height: event.nativeEvent.layout.height,
                    })}>
                    <GestureHandlerRootView style={styles.container}>
                        <GestureDetector gesture={composed}>
                            <Animated.View style={[styles.box, containerDimensions, animatedStyles]}>
                                <Image style={containerDimensions} source={image} resizeMode={'contain'}/>
                            </Animated.View>
                        </GestureDetector>
                    </GestureHandlerRootView>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    box: {
        backgroundColor: '#b58df1',
        borderRadius: 20,
    },
});
