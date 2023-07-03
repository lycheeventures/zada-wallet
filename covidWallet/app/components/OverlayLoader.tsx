import React from 'react';
import { View, ActivityIndicator, Text, Dimensions, DimensionValue } from 'react-native';

interface INProps {
  text?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  backgroundColor?: string;
  loaderColor?: string;
  textColor?: string;
}

const { width: defaultWidth } = Dimensions.get('screen');
const OverlayLoader = (props: INProps) => {
  const { text, backgroundColor, loaderColor, textColor, width, height } = props;

  let loaderWidth = width ? width : defaultWidth - 150;
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
          width: loaderWidth,
          height: height ? height : 'auto',
          padding: 10,
          backgroundColor: backgroundColor ? backgroundColor : 'rgba(0,0,0,0.8)',
          borderRadius: 10,
          justifyContent: 'center',
        }}>
        <ActivityIndicator color={loaderColor ? loaderColor : '#fff'} size={'small'} />
        {text && (
          <Text
            style={{
              fontSize: 12,
              marginTop: 5,
              color: textColor ? textColor : 'white',
              fontFamily: 'Poppins-Regular',
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
