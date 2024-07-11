import React from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, ScrollViewProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_COLOR, BLACK_COLOR } from '../theme/Colors';
import BorderButton from './BorderButton';
import ImageBoxComponent from './ImageBoxComponent';
import TextComponent from './TextComponent';

interface IProps {
  refreshing: boolean;
  onRefresh: () => void;
  text: string;
  image: string;
  screen?: string;
  onPress?: () => void;
  style?: ScrollViewProps;
}
const EmptyList = (props: IProps) => {
  // Selectors
  const { t } = useTranslation();

  // Constants
  const { refreshing, onRefresh, text, image, screen, onPress, style } = props;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={style}
      refreshControl={
        <RefreshControl tintColor={'#7e7e7e'} refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.EmptyContainer}>
      <TextComponent text={text} />
      <ImageBoxComponent source={image} />
      {screen == 'actions' && (
        <View style={styles.QRBtnContainer}>
          <BorderButton
            nextHandler={onPress}
            text={t('ActionsScreen.qr_code')}
            color={BLACK_COLOR}
            textColor={BLACK_COLOR}
            backgroundColor={BACKGROUND_COLOR}
            isIconVisible={true}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  EmptyContainer: {
    flex: 1,
    alignItems: 'center',
  },
  QRBtnContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: '3%',
  },
});

export default EmptyList;
