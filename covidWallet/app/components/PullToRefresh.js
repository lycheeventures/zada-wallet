import React from 'react';
import { useTranslation } from 'react-i18next';
import {StyleSheet, Text, View} from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';

const PullToRefresh = ({style, isLoading}) => {
  const { t } = useTranslation();
  return (
    <View
      style={[styles._mainContainer, style]}>
      <AntIcon name="arrowdown" size={15} color={'#7e7e7e'} />
      <Text style={styles._textStyle}>{t('common.pull_to_refresh')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  _textStyle: {
    alignSelf: 'center',
    color: '#7e7e7e',
    marginLeft: 5,
  },
});

export default PullToRefresh;
