import React, { useState } from 'react';
import { FlatList, StyleSheet, View, Text, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SearchBar } from 'react-native-elements';
import { AppColors } from '../../theme/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import TouchableComponent from '../../components/Buttons/TouchableComponent';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

interface INProps {
  data: { label: string; value: string }[];
  onSelect: (label: string, value: any) => void;
  onClose: () => void;
  preSelectedValue?: { label: string; value: string };
}

const SearchableList = (props: INProps) => {
  // Selectors
  const { t } = useTranslation(); // destructure i18n here

  // Constants
  const { width } = Dimensions.get('window');
  const { data, onSelect, onClose, preSelectedValue } = props;

  // States
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<{ label: string; value: string }[]>(data);

  // Functions
  const handleSearch = (text: string) => {
    setSearchText(text);
    // Filter the items based on the search text
    const filteredItems = data.filter(item =>
      item.label.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults(filteredItems);
  };

  const onItemSelected = (label: string, value: string) => {
    onSelect(label, value);
  };

  const renderListItems = ({ item }: { item: { label: string; value: string } }) => {
    let viewstyle = styles.itemView;
    let textStyle = styles.itemText;
    if (preSelectedValue && item.value === preSelectedValue.value) {
      viewstyle = { ...styles.itemView, ...styles.selectedItemStyle };
      textStyle = { ...styles.itemText, ...styles.selectedItemText };
    }

    return (
      <TouchableComponent
        onPress={() => onItemSelected(item.label, item.value)}
        style={{ borderRadius: 4, margin: 5, minWidth: width - 36 }}>
        <View style={viewstyle}>
          <Text style={textStyle}>{item.label}</Text>
          {preSelectedValue && item.value === preSelectedValue.value && (
            <FontAwesome5 name="check" size={20} color={AppColors.WHITE} />
          )}
        </View>
      </TouchableComponent>
    );
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <SearchBar
        placeholder={t('common.search')}
        onChangeText={handleSearch}
        value={searchText}
        containerStyle={styles.searchBarContainer}
        inputStyle={styles.searchBarInput}
        inputContainerStyle={{
          backgroundColor: AppColors.BACKGROUND,
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
            backgroundColor: AppColors.BLUE,
            alignSelf: 'center',
            marginBottom: 50,
          }}
          buttonTitleStyle={{ color: AppColors.WHITE }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    backgroundColor: AppColors.BACKGROUND,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderRadius: 4,
    width: '90%',
    padding: 0,
  },
  searchBarInput: {
    backgroundColor: AppColors.BACKGROUND,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  itemView: {
    backgroundColor: AppColors.LIGHT_GRAY,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 4,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedItemStyle: {
    backgroundColor: AppColors.BLUE,
    borderColor: AppColors.BLUE,
    borderWidth: 2,
    borderRadius: 4,
  },
  itemText: {
    color: AppColors.PRIMARY,
    fontFamily: 'Merriweather-Bold',
  },
  selectedItemText: {
    color: AppColors.WHITE,
    fontFamily: 'Merriweather-Bold',
  },
  flatListContainer: {
    paddingBottom: 50,
  },
  flatList: {
    marginTop: 16,
    marginBottom: 50,
  },
});

export default SearchableList;
