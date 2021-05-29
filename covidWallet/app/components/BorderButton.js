import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet,Image,View } from 'react-native';
import { BACKGROUND_COLOR, BLACK_COLOR, PRIMARY_COLOR, WHITE_COLOR } from '../theme/Colors';

function BorderButton(props) {

    const styles = StyleSheet.create({
        primaryButton: {
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: BLACK_COLOR,
            borderWidth: 1,
            borderRadius: 5,
            backgroundColor: BACKGROUND_COLOR,
            paddingTop: 5,
            paddingLeft: 20,
            paddingBottom: 5,
            paddingRight: 20,
            marginTop: 10,
            
        },
        text: {
            color: BLACK_COLOR,
            fontSize:15,
            fontFamily:'Poppins-Regular',
        },
        buttonIconSeparatorStyle: {
            backgroundColor: '#fff',
            width: 5,

          } ,bottom: {
            width: 35, height: 35
          },
    });

    return (
        <TouchableOpacity style={styles.primaryButton} onPress={props.nextHandler}>
             <Image
     source={require('../assets/images/qrcode.png')}
     style={styles.bottom}
    />
    <View style={styles.buttonIconSeparatorStyle} />
            <Text style={styles.text}>{props.text}</Text>
        </TouchableOpacity>
    )
}

export default BorderButton;