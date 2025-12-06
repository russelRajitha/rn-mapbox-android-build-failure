import React, {useState} from 'react';
import Animated, {useAnimatedStyle, useSharedValue,} from 'react-native-reanimated';
import {Gesture, GestureDetector, GestureHandlerRootView,} from 'react-native-gesture-handler';
import {Image, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";

function clamp(val: number, min: number, max: number) {
    'worklet'
    return Math.min(Math.max(val, min), max)
}

const image = require('./assets/img.png')
const MaxScale = 2.5
const MinScale = 1

export default function App() {
    const [containerDimensions, setContainerDimensions] = useState<{ width?: number; height?: number; }>({
        width: undefined,
        height: undefined,
    })

    const containerWidth = useSharedValue(0)
    const containerHeight = useSharedValue(0)

    const translationX = useSharedValue(0)
    const translationY = useSharedValue(0)
    const prevTranslationX = useSharedValue(0)
    const prevTranslationY = useSharedValue(0)

    const scale = useSharedValue(MinScale)
    const savedScale = useSharedValue(MinScale)

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [
            {translateX: translationX.value},
            {translateY: translationY.value},
            {scale: scale.value},
        ],
    }))

    const pinch = Gesture.Pinch()
        .onUpdate((e) => {
            const nextScale = clamp(savedScale.value * e.scale, MinScale, MaxScale)
            scale.value = nextScale

            // 2. Clamp translations for *this* scale
            const maxTranslateX = (containerWidth.value * (nextScale - MinScale)) / 2
            const maxTranslateY = (containerHeight.value * (nextScale - MinScale)) / 2

            translationX.value = clamp(
                translationX.value,
                -maxTranslateX,
                maxTranslateX
            )
            translationY.value = clamp(
                translationY.value,
                -maxTranslateY,
                maxTranslateY
            )
        })
        .onEnd(() => {
            savedScale.value = scale.value
        }).runOnJS(true)

    const doubleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(2)
        .onStart(() => {
            if (scale.value > MinScale) {
                scale.value = MinScale
                savedScale.value = MinScale
                translationX.value = 0
                translationY.value = 0
            } else {
                scale.value = MaxScale
                savedScale.value = MaxScale

                const maxTranslateX = (containerWidth.value * (MaxScale - MinScale)) / 2
                const maxTranslateY = (containerHeight.value * (MaxScale - MinScale)) / 2

                translationX.value = clamp(
                    translationX.value,
                    -maxTranslateX,
                    maxTranslateX
                )
                translationY.value = clamp(
                    translationY.value,
                    -maxTranslateY,
                    maxTranslateY
                )
            }
        })

    const pan = Gesture.Pan()
        .minDistance(MinScale)
        .onStart(() => {
            prevTranslationX.value = translationX.value
            prevTranslationY.value = translationY.value
        })
        .onUpdate((event) => {
            const maxTranslateX = (containerWidth.value * (scale.value - MinScale)) / 2
            const maxTranslateY = (containerHeight.value * (scale.value - MinScale)) / 2

            const nextX = prevTranslationX.value + event.translationX
            const nextY = prevTranslationY.value + event.translationY

            translationX.value = clamp(nextX, -maxTranslateX, maxTranslateX)
            translationY.value = clamp(nextY, -maxTranslateY, maxTranslateY)
        })

    const composed = Gesture.Race(pan, pinch, doubleTap)

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{flex: 1}}>
                <View
                    style={{flex: 1, backgroundColor: 'red', overflow: 'hidden'}}
                    onLayout={(event) => {
                        const {width, height} = event.nativeEvent.layout
                        setContainerDimensions({width, height})
                        containerWidth.value = width
                        containerHeight.value = height
                    }}
                >
                    <GestureHandlerRootView style={styles.container}>
                        <GestureDetector gesture={composed}>
                            <Animated.View
                                style={[styles.box, containerDimensions, animatedStyles]}
                            >
                                <Image
                                    style={containerDimensions}
                                    source={image}
                                    resizeMode={'contain'}
                                />
                            </Animated.View>
                        </GestureDetector>
                    </GestureHandlerRootView>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    box: {
        backgroundColor: '#b58df1',
        borderRadius: 20,
    },
})
