import React from 'react';
import { View, StyleSheet, Dimensions, Image, ImageSourcePropType } from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppColors } from '../../theme/Colors';

interface IActionItems {
  title: string;
  onPress: () => void;
  iconName?: string;
  imageSrc?: ImageSourcePropType;
  buttonColor?: string;
}
interface IProps {
  buttonColor: string;
  onPress?: () => void;
  actionItems?: IActionItems[];
}

const window = Dimensions.get('screen');
const FloatingActionButton = (props: IProps) => {
  return (
    <View style={{ backgroundColor: '#f3f3f3' }}>
      <ActionButton
        size={window.width / 7}
        buttonColor={props.buttonColor}
        onPress={props.onPress}
        renderIcon={() => <Icon name="plus" style={styles.actionButtonIcon} />}
        nativeFeedbackRippleColor={AppColors.TRANSPARENT}>
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
                {item.iconName ? (
                  <Icon name={item.iconName} style={styles.actionButtonItemIcon} />
                ) : (
                  <Image source={item.imageSrc} style={styles.actionButtonItemImage} />
                )}
              </ActionButton.Item>
            );
          })}
      </ActionButton>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: window.width / 20,
    color: 'white',
  },
  actionButtonItemIcon: {
    fontSize: 20,
    height: 22,
    color: 'black',
  },
  actionButtonItemImage: {
    fontSize: 20,
    height: 35,
    width: 35,
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
