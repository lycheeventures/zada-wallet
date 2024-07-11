import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SearchableList from '../../components/List/SearchableList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { LanguageList } from '../utils';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectUser } from '../../store/auth/selectors';
import { updateUser } from '../../store/auth';
import { updateUserProfile } from '../../store/auth/thunk';

interface INProps {
  navigation: NativeStackNavigationProp<MainStackParamList>;
}

const LanguageSelectionScreen = (props: INProps) => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();
  const { navigation } = props;

  // Selectors
  const { i18n } = useTranslation(); // destructure i18n here
  const user = useAppSelector(selectUser);
  const selectedLanguage = LanguageList.find(x => x.value === user.language);

  // Functions
  const onSelect = (label: string, value: string) => {
    dispatch(updateUser({ ...user, language: value }));
    dispatch(
      updateUserProfile({
        language: value,
      })
    );
    i18n.changeLanguage(value);
  };

  const onClose = () => {
    navigation.goBack();
  };

  return (
    <View style={{ paddingTop: 24 }}>
      <SearchableList
        preSelectedValue={selectedLanguage}
        data={LanguageList}
        onSelect={onSelect}
        onClose={onClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default LanguageSelectionScreen;
