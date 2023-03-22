import React from 'react';
import { View, ActivityIndicator, Text, Dimensions } from 'react-native';

interface INProps {
  text: string;
  backgroundColor?: string;
  loaderColor?: string;
  textColor?: string;
}

const { width } = Dimensions.get('screen');
const OverlayLoader = (props: INProps) => {
  const { text, backgroundColor, loaderColor, textColor } = props;
  return (
    <View
      style={{
        zIndex: 10,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: width - 150,
          padding: 10,
          backgroundColor: backgroundColor ? backgroundColor : 'rgba(0,0,0,0.8)',
          borderRadius: 10,
        }}>
        <ActivityIndicator color={loaderColor ? loaderColor : '#fff'} size={'small'} />
        {text && (
          <Text
            style={{
              fontSize: 12,
              marginTop: 5,
              color: textColor ? textColor : 'white',
              textAlign: 'center',
            }}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

export default OverlayLoader;