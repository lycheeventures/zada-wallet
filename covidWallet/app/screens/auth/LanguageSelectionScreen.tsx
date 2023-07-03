import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FAB } from '@rneui/themed';
import { AppColors } from '../../theme/Colors';
import FadeView from '../../components/FadeView';
import { _showAlert } from '../../helpers';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { LanguageList } from './utils';
import { selectUser } from '../../store/auth/selectors';
import { updateUser } from '../../store/auth';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}

const LanguageSelectionScreen = (props: INProps) => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const user = useAppSelector(selectUser);

  const [selectedValue, setSelectedValue] = useState('en');

  const handleSubmit = () => {
    dispatch(updateUser({ ...user, language: selectedValue }));
    // props.navigation.navigate('CountrySelectionScreen');
  };

  // Render individual country item
  const RadioButtonTile = ({ item }: { item: { label: string; value: string } }) => {
    return (
      <View style={styles.radioButtonContainer}>
        <TouchableOpacity
          key={item.value}
          style={[
            styles.radioButton,
            {
              backgroundColor: item.value === selectedValue ? AppColors.SUBHEADING_BLUE : AppColors.WHITE,
            },
          ]}
          onPress={() => setSelectedValue(item.value)}>
          <Text
            style={[
              styles.radioButtonLabel,
              {
                color: item.value === selectedValue ? AppColors.WHITE : AppColors.BLACK,
              },
            ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // console.log();
  return (
    <FadeView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.headingText}>Select Language</Text>
            <Text style={styles.subHeadingText}>Please select your language</Text>
          </View>

          <View style={styles.formContainer}>
            <FlatList
              data={LanguageList}
              renderItem={RadioButtonTile}
              keyExtractor={(item) => item.value}
              initialNumToRender={20}
              contentContainerStyle={styles.contentContainerStyle}
            />
          </View>
          <FAB
            visible={true}
            icon={{ name: 'arrow-forward', color: AppColors.WHITE }}
            color={AppColors.SUBHEADING_BLUE}
            style={{ alignSelf: 'flex-end' }}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </FadeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: AppColors.TRANSPARENT,
    justifyContent: 'center',
  },
  headingText: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
    color: AppColors.BLACK,
  },
  subHeadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: AppColors.GRAY,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  formContainer: {
    flex: 0.9,
  },
  radioButtonContainer: {},
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    height: 70,
    margin: 4,
    justifyContent: 'center',
    borderRadius: 35,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radioButtonLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  radioButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'gray',
  },
  contentContainerStyle: {
    paddingBottom: 24,
  },
});

export default LanguageSelectionScreen;
