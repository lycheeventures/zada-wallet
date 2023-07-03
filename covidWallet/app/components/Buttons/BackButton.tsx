import React from 'react';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('screen');
import AntIcon from 'react-native-vector-icons/AntDesign';

interface INProps {
  color: string;
  onPress: () => void;
  style?: object;
}

const BackButton = (props: INProps) => {
  const { color, onPress, style } = props;

  return (
    <AntIcon
      onPress={onPress}
      name="arrowleft"
      color={color}
      size={26}
      style={[
        {
          position: 'absolute',
          left: width * 0.03,
          top: height * 0.06,
          zIndex: 10,
          padding: 5,
        },
        style,
      ]}
    />
  );
};

export default BackButton;
