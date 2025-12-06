import React, {useCallback, useState} from 'react';
import Animated, {useAnimatedStyle, useSharedValue,} from 'react-native-reanimated';
import {Gesture, GestureDetector, GestureHandlerRootView,  GestureUpdateEvent, PinchGestureHandlerEventPayload,PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {LayoutChangeEvent} from "react-native/Libraries/Types/CoreEventTypes";

function clamp(val: number, min: number, max: number) {
    'worklet'
    return Math.min(Math.max(val, min), max)
}

const image = require('./assets/img.png')
const MaxScale = 2.5
const MinScale = 1

export default function App() {
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
    const pinchOnUpdate = useCallback((e: GestureUpdateEvent<PinchGestureHandlerEventPayload>) => {
        const nextScale = clamp(savedScale.value * e.scale, MinScale, MaxScale)
        scale.value = nextScale
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
    },[])
    const pinchOnEnd = useCallback(() => {
        savedScale.value = scale.value
    },[])
    const pinch = Gesture.Pinch()
        .onUpdate(pinchOnUpdate)
        .onEnd(pinchOnEnd)


    const doubleTapOnStart = useCallback(() => {
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
    },[])
    const doubleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(2)
        .onStart(doubleTapOnStart)

    const panOnStart = useCallback(() => {
        prevTranslationX.value = translationX.value
        prevTranslationY.value = translationY.value
    },[])
    const panOnUpdate = useCallback((event:GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
        const maxTranslateX = (containerWidth.value * (scale.value - MinScale)) / 2
        const maxTranslateY = (containerHeight.value * (scale.value - MinScale)) / 2

        const nextX = prevTranslationX.value + event.translationX
        const nextY = prevTranslationY.value + event.translationY

        translationX.value = clamp(nextX, -maxTranslateX, maxTranslateX)
        translationY.value = clamp(nextY, -maxTranslateY, maxTranslateY)
    },[])

    const pan = Gesture.Pan()
        .minDistance(MinScale)
        .onStart(panOnStart)
        .onUpdate(panOnUpdate)

    const composed = Gesture.Race(pan, pinch, doubleTap)
    const sizeStyle = useAnimatedStyle(() => ({
        width: containerWidth.value,
        height: containerHeight.value,
    }))

    const onLayoutContainer = useCallback((event:LayoutChangeEvent) => {
        containerWidth.value = event.nativeEvent.layout.width
        containerHeight.value = event.nativeEvent.layout.height
    },[])
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{flex: 1}}>
                <View
                    style={{flex: 1, backgroundColor: 'red', overflow: 'hidden'}}
                    onLayout={onLayoutContainer}
                >
                    <GestureHandlerRootView style={styles.container}>
                        <GestureDetector gesture={composed}>
                            <Animated.Image
                                style={[styles.box, sizeStyle, animatedStyles]}
                                source={image}
                                resizeMode={'contain'}
                            />
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
