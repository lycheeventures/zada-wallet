import React, { useMemo, useState } from 'react';
import { View, StyleSheet, RefreshControl, FlatList } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { themeStyles } from '../../../theme/Styles';
import PullToRefresh from '../../../components/PullToRefresh';
import EmptyList from '../../../components/EmptyList';
import { PRIMARY_COLOR, WHITE_COLOR } from '../../../theme/Colors';
import { get_local_issue_date } from '../../../helpers/time';
import CardBackground from '../../../components/CardBackground';
import CertificateCard from '../../../components/CertificateCard';

import { useAppDispatch, useAppSelector } from '../../../store';
import {
  selectCredentialsStatus,
  selectSearchedCredentials,
} from '../../../store/credentials/selectors';
import { fetchCredentials } from '../../../store/credentials/thunk';
import { updateCredential } from '../../../store/credentials';

function Credentials(props) {
  // Constants
  const dispatch = useAppDispatch();

  // States
  const [search, setSearch] = useState('');

  // Selectors
  const credentialStatus = useAppSelector(selectCredentialsStatus);
  const searchedCredentials = useAppSelector((state) =>
    selectSearchedCredentials(state, search)
  );

  // Function
  const toggleModal = (v) => {
    props.navigation.navigate('DetailsScreen', {
      data: v,
    });
  };

  const updateBackgroundImage = (credentialId, background_url) => {
    console.log(credentialId, background_url);
    dispatch(
      updateCredential({ id: credentialId, changes: { backgroundImage: background_url } })
    );
  };

  // List Empty Component
  const emptyListComponent = (item) => (
    <EmptyList
      // refreshing={refreshing}
      // onRefresh={fetchCredentials}
      text="There are no certificates in your wallet. Once you receive a certificate, it will show up here."
      image={require('../../../assets/images/credentialsempty.png')}
      style={styles.emptyListStyle}
    />
  );

  // List Header Component
  const listHeaderComponent = useMemo(
    () => (
      <View style={styles._searchContainer}>
        <TextInput
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          style={styles._searchInput}
        />
        <FeatherIcon name="search" size={24} color={PRIMARY_COLOR} />
      </View>
    ),
    [search]
  );

  // List Items
  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => toggleModal(item)} activeOpacity={0.9}>
        <View style={styles.CredentialsCardContainer}>
          <CardBackground
            updateBackgroundImage={updateBackgroundImage}
            item={item}
            schemeId={item.schemaId}>
            <CertificateCard
              card_type={item.type}
              issuer={item.organizationName}
              date={
                item.values['Issue Time']
                  ? get_local_issue_date(item.values['Issue Time'])
                  : undefined
              }
              card_logo={{ uri: item.imageUrl }}
            />
          </CardBackground>
        </View>
      </TouchableOpacity>
    );
  };

  // Refresh List
  const refreshHandler = () => {
    dispatch(fetchCredentials());
  };

  return (
    <View style={themeStyles.mainContainer}>
      <PullToRefresh />
      <FlatList
        refreshControl={
          <RefreshControl
            tintColor={'#7e7e7e'}
            refreshing={credentialStatus === 'loading'}
            onRefresh={refreshHandler}
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.flatListStyle}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={emptyListComponent}
        data={searchedCredentials}
        contentContainerStyle={styles.flatListContainerStyle}
        keyExtractor={(item, index) => item.credentialId + ':' + index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  _searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 45,
    borderRadius: 10,
    backgroundColor: WHITE_COLOR,
    paddingHorizontal: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10,
    marginTop: 15,
  },
  _searchInput: {
    width: '88%',
    height: '100%',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  CredentialsCardContainer: {
    paddingTop: 5,
  },
  flatListStyle: {
    flexGrow: 1,
  },
  flatListContainerStyle: {
    width: '100%',
  },
  emptyListStyle: {
    marginTop: 15,
  },
});

export default Credentials;
