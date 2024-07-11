import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '@rneui/themed';
import Modal from 'react-native-modal';
import { AppColors } from '../../theme/Colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { CountryCode, Flag } from 'react-native-country-picker-modal';
import TouchableComponent from '../Buttons/TouchableComponent';
import { FAB } from 'react-native-elements';
import { HeaderLeftButton } from '../../screens/auth/components/buttons/HeaderButtons';

interface INProps {
  data: { label: string; value: string; imageUrl?: string }[];
  isVisible: boolean;
  onSelect: (label: string, value: any) => void;
  onClose: () => void;
  handleSubmit?: () => void;
  title?: string;
  imageUrl?: string;
  subTitle?: string;
  type?: 'country';
}

const SelectModal = (props: INProps) => {
  // Constants
  const insets = useSafeAreaInsets();
  const { data, isVisible, onSelect, onClose, title, subTitle, imageUrl, type, handleSubmit } =
    props;
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] =
    useState<{ label: string; value: string; imageUrl?: string }[]>(data);

  useEffect(() => {
    setSearchResults(data);
  }, [data]);

  const handleSearch = (text: any) => {
    setSearchText(text);

    // Filter the items based on the search text
    const filteredItems = data.filter(item =>
      item.label.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults(filteredItems);
  };

  const renderListItems = ({
    item,
  }: {
    item: {
      label: string;
      value: string;
      imageUrl?: string;
    };
  }) => {
    if (type === 'country') {
      return (
        <TouchableComponent
          onPress={() => onSelect(item.label, item.value)}
          underlayColor={AppColors.LIGHT_GRAY}
          style={styles.touchableView}>
          <View style={styles.itemView}>
            <Flag
              key={item.value}
              flagSize={25}
              countryCode={item.value as CountryCode}
              withFlagButton={true}
            />
            <Text style={styles.itemText}>{item.label}</Text>
          </View>
        </TouchableComponent>
      );
    } else {
      return (
        <TouchableComponent
          onPress={() => onSelect(item.label, item.value)}
          underlayColor={AppColors.LIGHT_GRAY}
          style={styles.touchableView}>
          <View style={styles.itemView}>
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 25, height: 25, marginRight: 8 }}
              />
            )}
            <Text style={styles.itemText}>{item.label}</Text>
          </View>
        </TouchableComponent>
      );
    }
  };

  const ListEmptyComponent = () => {
    return (
      <View style={{ height: 400, alignItems: 'center', justifyContent: 'center' }}>
        <FontAwesomeIcon name="search" size={30} color={AppColors.LIGHT_GRAY} />
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: 16,
            marginTop: 16,
            color: AppColors.LIGHT_GRAY,
          }}>
          No results found
        </Text>
      </View>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      style={{
        backgroundColor: AppColors.WHITE,
        margin: 0,
        paddingTop: insets.top,
      }}
      animationInTiming={500}
      animationOutTiming={500}
      useNativeDriver={false}
      onBackButtonPress={onClose}
      backdropOpacity={0.8}>
      <View style={styles.container}>
        <View style={{ maxWidth: 100 }}>
          <HeaderLeftButton onPress={onClose} underlayColor="#fff" />
        </View>
        <View>
          <View style={styles.logoContainer}>
            <Text style={styles.headingText}>{title}</Text>
            <Text style={styles.subHeadingText}>{subTitle}</Text>
          </View>
        </View>
        <View style={styles.searchBarViewStyle}>
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
        </View>
        <FlatList
          data={searchResults}
          renderItem={renderListItems}
          keyExtractor={item => item.value}
          ListEmptyComponent={ListEmptyComponent}
          style={styles.flatListStyle}
          contentContainerStyle={styles.flatListContainerStyle}
        />
        {handleSubmit && (
          <FAB
            visible={true}
            icon={{ name: 'arrow-forward', color: 'white' }}
            color={AppColors.PRIMARY}
            style={{ alignSelf: 'flex-end', marginBottom: 16, marginRight: 8 }}
            onPress={handleSubmit}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  headingText: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
  },
  subHeadingText: {
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
    color: AppColors.PRIMARY,
  },
  logoContainer: {
    marginTop: 24,
  },

  searchBarViewStyle: {
    // borderWidth: 2,
  },
  searchBarContainer: {
    backgroundColor: AppColors.TRANSPARENT,
    borderBottomWidth: -0,
    borderTopWidth: 0,
  },
  searchBarInput: {
    backgroundColor: AppColors.LIGHT_GRAY,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  touchableView: {
    marginHorizontal: 16,
    backgroundColor: AppColors.DISABLED_COLOR,
    borderRadius: 30,
    padding: 8,
    marginTop: 8,
  },
  itemView: {
    marginHorizontal: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  itemText: {
    paddingLeft: 24,
    color: AppColors.BLACK,
    fontFamily: 'Poppins-Regular',
  },
  flatListContainerStyle: {
    marginTop: 0,
    paddingBottom: 50,
  },
  flatListStyle: {
    // flex: 1,
    marginTop: 16,
    marginBottom: 50,
  },
});

export default SelectModal;
