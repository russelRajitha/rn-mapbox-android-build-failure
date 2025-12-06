import React, {useRef} from 'react';
import Animated from 'react-native-reanimated';
import {GestureDetector, GestureHandlerRootView,} from 'react-native-gesture-handler';
import {Button, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import ImagesZoomable from "./ImagesZoomable";

const images = [
    require('./assets/img.png'),
    require('./assets/img1.png'),
    require('./assets/img2.png'),
]

export default function App() {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const zoomRef = useRef<{setIndex:(i:number)=>void}>(null)


    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <SafeAreaView style={{flex: 1}}>
                    <ImagesZoomable ref={zoomRef} onChangeIndex={setCurrentIndex} images={images}/>
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Button title={'Set 1'} onPress={()=>zoomRef.current?.setIndex(0)}/>
                        <Button title={'Set 2'} onPress={()=>zoomRef.current?.setIndex(1)}/>
                        <Button title={'Set 3'} onPress={()=>zoomRef.current?.setIndex(2)}/>
                        <Text>Current Index: {currentIndex}</Text>
                    </View>
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
