import React from 'react';
import { View, StyleSheet } from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppColors } from '../../theme/Colors';

interface IActionItems {
  title: string;
  onPress: () => void;
  iconName: string;
  buttonColor?: string;
}
interface IProps {
  buttonColor: string;
  onPress?: () => void;
  actionItems?: IActionItems[];
}

const FloatingActionButton = (props: IProps) => {
  return (
    <View style={{ backgroundColor: '#f3f3f3' }}>
      <ActionButton
        size={50}
        buttonColor={props.buttonColor}
        useNativeFeedback
        fixNativeFeedbackRadius
        onPress={props.onPress}
        renderIcon={() => <Icon name="plus" style={styles.actionButtonIcon} />}
        nativeFeedbackRippleColor={AppColors.LIGHT_GRAY}>
        {props.actionItems &&
          props.actionItems.map((item, index) => {
            return (
              <ActionButton.Item
                buttonColor={item.buttonColor || props.buttonColor}
                title={item.title}
                onPress={item.onPress}
                key={index}
                textStyle={{ fontFamily: 'Poppins-Regular' }}
                style={styles.actionButtonItemStyle}>
                <Icon name={item.iconName} style={styles.actionButtonItemIcon} />
              </ActionButton.Item>
            );
          })}
      </ActionButton>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  actionButtonItemIcon: {
    fontSize: 20,
    height: 22,
    color: 'black',
  },
  actionButtonItemStyle: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingActionButton;
