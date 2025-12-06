import React, {useCallback} from 'react';
import Animated, {useAnimatedStyle, useSharedValue, withDecay} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
    GestureUpdateEvent,
    PanGestureHandlerEventPayload,
    PinchGestureHandlerEventPayload
} from 'react-native-gesture-handler';
import {StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {LayoutChangeEvent} from "react-native/Libraries/Types/CoreEventTypes";
import {ImageLoadEvent} from "react-native/Libraries/Image/Image";

function clamp(val: number, min: number, max: number) {
    'worklet'
    return Math.min(Math.max(val, min), max)
}

function getMaxTranslate(
    scaleVal: number,
    containerWidth: number,
    containerHeight: number,
    imageWidth: number,
    imageHeight: number
) {
    'worklet'
    if (
        containerWidth === 0 ||
        containerHeight === 0 ||
        imageWidth === 0 ||
        imageHeight === 0
    ) {
        return {maxX: 0, maxY: 0}
    }

    // Base size of the image as you render it: width = containerWidth, height keeps aspect ratio
    const baseWidth = containerWidth
    const baseHeight = (imageHeight / imageWidth) * baseWidth

    const scaledWidth = baseWidth * scaleVal
    const scaledHeight = baseHeight * scaleVal

    // Allow panning only if the scaled dimension is larger than the container
    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2)
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2)

    return {maxX, maxY}
}

const MIN_VELOCITY = 50
const image = require('./assets/img.png')
const MaxScale = 2.5
const MinScale = 1

export default function App() {
    const containerWidth = useSharedValue(0)
    const containerHeight = useSharedValue(0)
    const imageWidth = useSharedValue(0)
    const imageHeight = useSharedValue(0)

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
        'worklet'
        const nextScale = clamp(savedScale.value * e.scale, MinScale, MaxScale)
        scale.value = nextScale

        const {maxX, maxY} = getMaxTranslate(
            nextScale,
            containerWidth.value,
            containerHeight.value,
            imageWidth.value,
            imageHeight.value,
        )

        translationX.value = clamp(translationX.value, -maxX, maxX)
        translationY.value = clamp(translationY.value, -maxY, maxY)
    }, [])
    const pinchOnEnd = useCallback(() => {
        savedScale.value = scale.value
    }, [])
    const pinch = Gesture.Pinch()
        .onUpdate(pinchOnUpdate)
        .onEnd(pinchOnEnd)

    const doubleTapOnStart = useCallback(() => {
        'worklet'
        if (scale.value > MinScale) {
            // reset
            scale.value = MinScale
            savedScale.value = MinScale
            translationX.value = 0
            translationY.value = 0
        } else {
            scale.value = MaxScale
            savedScale.value = MaxScale

            const {maxX, maxY} = getMaxTranslate(
                MaxScale,
                containerWidth.value,
                containerHeight.value,
                imageWidth.value,
                imageHeight.value,
            )

            translationX.value = clamp(translationX.value, -maxX, maxX)
            translationY.value = clamp(translationY.value, -maxY, maxY)
        }
    }, [])

    const doubleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(2)
        .onStart(doubleTapOnStart)

    const panOnStart = useCallback(() => {
        prevTranslationX.value = translationX.value
        prevTranslationY.value = translationY.value
    }, [])
    const panOnUpdate = useCallback((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
        'worklet'

        // Optional: don’t allow panning when not zoomed in
        if (scale.value <= MinScale) {
            translationX.value = 0
            translationY.value = 0
            return
        }

        const {maxX, maxY} = getMaxTranslate(
            scale.value,
            containerWidth.value,
            containerHeight.value,
            imageWidth.value,
            imageHeight.value,
        )

        const nextX = prevTranslationX.value + event.translationX
        const nextY = prevTranslationY.value + event.translationY

        translationX.value = clamp(nextX, -maxX, maxX)
        translationY.value = clamp(nextY, -maxY, maxY)
    }, [])
    const panOnEnd = useCallback((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
        'worklet'

        if (scale.value <= MinScale) {
            translationX.value = 0
            translationY.value = 0
            return
        }

        const {maxX, maxY} = getMaxTranslate(
            scale.value,
            containerWidth.value,
            containerHeight.value,
            imageWidth.value,
            imageHeight.value,
        )


        const vx = event.velocityX
        const vy = event.velocityY

        if (Math.abs(vx) > MIN_VELOCITY) {
            translationX.value = withDecay({
                velocity: vx,
                clamp: [-maxX, maxX],
            })
        } else {
            translationX.value = clamp(translationX.value, -maxX, maxX)
        }

        if (Math.abs(vy) > MIN_VELOCITY) {
            translationY.value = withDecay({
                velocity: vy,
                clamp: [-maxY, maxY],
            })
        } else {
            translationY.value = clamp(translationY.value, -maxY, maxY)
        }
    }, [])

    const pan = Gesture.Pan()
        .minDistance(MinScale)
        .onStart(panOnStart)
        .onUpdate(panOnUpdate)
        .onEnd(panOnEnd)

    const composed = Gesture.Race(Gesture.Simultaneous(pan, pinch), doubleTap)
    const sizeStyle = useAnimatedStyle(() => ({
        width: containerWidth.value,
        height: (imageHeight.value / imageWidth.value) * containerWidth.value,
    }))

    const onLayoutContainer = useCallback((event: LayoutChangeEvent) => {
        containerWidth.value = event.nativeEvent.layout.width
        containerHeight.value = event.nativeEvent.layout.height
    }, [])
    const onLoadImage = useCallback((event: ImageLoadEvent) => {
        imageWidth.value = event.nativeEvent.source.width
        imageHeight.value = event.nativeEvent.source.height
    }, [])

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <SafeAreaView style={{flex: 1}}>
                    <GestureDetector gesture={composed}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: 'red',
                                overflow: 'hidden',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onLayout={onLayoutContainer}
                        >
                            <Animated.Image
                                onLoad={onLoadImage}
                                style={[styles.box, sizeStyle, animatedStyles]}
                                source={image}
                                resizeMode={'contain'}
                            />

                        </View>
                    </GestureDetector>
                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>

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
