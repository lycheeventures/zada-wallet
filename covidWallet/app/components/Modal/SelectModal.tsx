import React, { useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '@rneui/themed';
import Modal from 'react-native-modal';
import { AppColors } from '../../theme/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { CountryCode, Flag } from 'react-native-country-picker-modal';
import PrimaryButton from '../PrimaryButton';
import TouchableComponent from '../Buttons/TouchableComponent';

interface INProps {
  data: { label: string; value: string }[];
  isVisible: boolean;
  onSelect: (label: string, value: any) => void;
  onClose: () => void;
  type?: 'country';
}

const SelectModal = (props: INProps) => {
  // Constants
  const insets = useSafeAreaInsets();
  const { data, isVisible, onSelect, onClose, type } = props;
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<{ label: string; value: string }[]>(data);

  const handleSearch = (text: any) => {
    setSearchText(text);

    // Filter the items based on the search text
    const filteredItems = data.filter((item) =>
      item.label.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults(filteredItems);
  };

  const renderListItems = ({ item }: { item: { label: string; value: string } }) => {
    if (type === 'country') {
      return (
        <TouchableComponent
          onPress={() => onSelect(item.label, item.value)}
          style={styles.itemView}>
          <>
            <Flag
              key={item.value}
              flagSize={25}
              countryCode={item.value as CountryCode}
              withFlagButton={true}
            />
            <Text style={styles.itemText}>{item.label}</Text>
          </>
        </TouchableComponent>
      );
    } else {
      return (
        <TouchableComponent
          onPress={() => onSelect(item.label, item.value)}
          style={styles.itemView}>
          <Text style={styles.itemText}>{item.label}</Text>
        </TouchableComponent>
      );
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      style={{
        backgroundColor: AppColors.WHITE,
        alignItems: 'center',
        margin: 0,
        paddingTop: insets.top,
      }}
      backdropOpacity={0.8}>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
        }}>
        <FontAwesomeIcon
          onPress={onClose}
          name="close"
          size={25}
          style={{
            marginTop: 120,
            color: AppColors.BLACK,
            alignSelf: 'flex-end',
            top: 24,
            right: 24,
          }}
        />
      </View>

      <SearchBar
        placeholder="Search..."
        onChangeText={handleSearch}
        value={searchText}
        containerStyle={styles.searchBarContainer}
        inputStyle={styles.searchBarInput}
        inputContainerStyle={{
          backgroundColor: AppColors.LIGHT_GRAY,
        }}
      />
      <View>
        <FlatList
          data={searchResults}
          renderItem={renderListItems}
          contentContainerStyle={styles.flatListContainer}
          keyboardShouldPersistTaps="handled"
          style={styles.flatList}
        />
        <PrimaryButton
          title={'Confirm'}
          onPress={onClose}
          disabled={false}
          buttonStyle={{
            backgroundColor: AppColors.PRIMARY,
            alignSelf: 'center',
            marginBottom: 50,
          }}
          buttonTitleStyle={{ color: AppColors.WHITE }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    backgroundColor: AppColors.TRANSPARENT,
    marginTop: 56,
    height: 40,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    width: '90%',
    padding: 0,
  },
  searchBarInput: {
    backgroundColor: AppColors.LIGHT_GRAY,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  itemView: {
    width: 400,
    marginLeft: 24,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  itemText: {
    color: AppColors.BLACK,
    fontFamily: 'Poppins-Regular',
  },
  flatListContainer: {
    paddingBottom: 50,
  },
  flatList: {
    marginTop: 16,
    marginBottom: 50,
  },
});

export default SelectModal;
