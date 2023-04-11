import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TouchableComponent from '../Buttons/TouchableComponent';
import { ZohoSalesIQOpenChat } from './utils';

interface INProps {
  iconColor: string;
  backgroundColor: string;
}

const ChatBubble = (props: INProps) => {
  const { iconColor, backgroundColor } = props;

  return (
    <TouchableComponent
      onPress={ZohoSalesIQOpenChat}
      style={{
        height: 50,
        width: 50,
        borderRadius: 25,
        backgroundColor: backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Ionicons name="ios-chatbubbles" color={iconColor} size={25} />
    </TouchableComponent>
  );
};

export default ChatBubble;
