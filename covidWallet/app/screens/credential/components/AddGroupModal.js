import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View, SafeAreaView, Pressable } from 'react-native';
import Modal from 'react-native-modal';
import { useTranslation } from 'react-i18next';
import {
  BACKGROUND_COLOR,
  WHITE_COLOR,
  PRIMARY_COLOR,
  GREEN_COLOR,
  GRAY_COLOR,
} from '../../../theme/Colors';
import HeadingComponent from '../../../components/HeadingComponent';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { InputComponent } from '../../../components/Input/inputComponent';
import SimpleButton from '../../../components/Buttons/SimpleButton';
import CredentialsCard from '../../../components/CredentialsCard';
import EmptyList from '../../../components/EmptyList';
import { get_local_issue_date } from '../../../helpers/time';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectSearchedCredentials } from '../../../store/credentials/selectors';
import { updateCredential } from '../../../store/credentials';

const AddGroupModal = ({
  isVisible,
  credentials,
  groupName,
  groupNameError,
  onGroupNameChange,
  onCreateGroupClick,
  onCloseClick,
  onRefresh,
  refreshing,
}) => {
  // Constants
  const dispatch = useAppDispatch();

  // Selectors
  const { t } = useTranslation();

  // States
  const [search, setSearch] = useState('');
  const [creds, setCreds] = useState([]);

  const filteredCreds = useAppSelector((state) => selectSearchedCredentials(state, search));

  useEffect(() => {
    const _changeCreds = () => {
      let temp = [];
      credentials.forEach((item, index) => {
        let obj = {
          ...item,
          selected: false,
        };
        temp.push(obj);
      });
      setCreds(temp);
    };
    _changeCreds();
  }, [credentials, isVisible]);

  const updateBackgroundImage = (credentialId, background_url) => {
    dispatch(updateCredential({ id: credentialId, changes: { backgroundImage: background_url } }));
  };

  const _searchInputHandler = (searchText) => {
    setSearch(searchText);
  };

  const renderItem = ({ item, index }) => {
    let date = item.values['Issue Time']
      ? get_local_issue_date(item.values['Issue Time'])
      : item.issuedAtUtc
        ? get_local_issue_date(item.issuedAtUtc)
        : undefined;
    return (
      <Pressable
        style={{ marginBottom: 5 }}
        onPress={() => {
          let credIndex = creds.findIndex((c) => c.credentialId === item.credentialId);
          creds[credIndex].selected = !creds[credIndex].selected;
          setSearch('');
          setCreds([...creds]);
        }}>
        <CredentialsCard
          updateBackgroundImage={updateBackgroundImage}
          item={item}
          schemeId={item['schemaId']}
          card_title={item.name}
          card_type={item.type}
          issuer={item.organizationName}
          card_user=""
          date={date}
          card_logo={{ uri: item.imageUrl }}
        />
        {item.selected && (
          <FeatherIcon
            name="check"
            size={30}
            color={GREEN_COLOR}
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
            }}
          />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={() => {
        onCloseClick();
      }}
      onBackdropPress={() => {
        onCloseClick();
      }}
      style={{
        margin: 0,
      }}>
      <SafeAreaView style={styles._mainContainer}>
        <HeadingComponent text={t('CredentialsScreen.new_group')} />

        {/* Group Name */}
        <View
          style={{
            width: '95%',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <InputComponent
            type="default"
            height={45}
            placeholderText={t('CredentialsScreen.group_name')}
            errorMessage={groupNameError}
            value={groupName}
            inputContainerStyle={styles._inputView}
            setStateValue={onGroupNameChange}
          />
        </View>

        {/* Search Credentials */}
        <View
          style={{
            width: '95%',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <InputComponent
            type="default"
            height={45}
            placeholderText={t('common.search')}
            value={search}
            inputContainerStyle={[styles._inputView, { marginTop: 10 }]}
            setStateValue={_searchInputHandler}
            rightIcon={() => (
              <FeatherIcon
                name="search"
                size={24}
                color={PRIMARY_COLOR}
                style={{ marginHorizontal: 15 }}
              />
            )}
          />
        </View>

        {creds.length > 0 ? (
          <FlatList
            onRefresh={onRefresh}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
            data={search ? filteredCreds : creds}
            style={{
              width: '100%',
              height: Dimensions.get('window').width * 0.6,
              marginTop: 25,
            }}
            contentContainerStyle={{
              width: '90%',
              alignSelf: 'center',
            }}
            keyExtractor={(item, index) => item.credentialId + ':' + index.toString()}
            renderItem={renderItem}
          />
        ) : (
          <EmptyList
            onRefresh={onRefresh}
            refreshing={refreshing}
            text={t('CredentialsScreen.all_certificates_empty_list_text')}
            image={require('../../../assets/images/credentialsempty.png')}
            style={{
              marginTop: 20,
            }}
          />
        )}
        <SimpleButton
          width={250}
          onPress={() => {
            onCreateGroupClick(creds);
          }}
          title={t('CredentialsScreen.create_group')}
          titleColor={WHITE_COLOR}
          buttonColor={GREEN_COLOR}
          style={{ marginTop: 20 }}
        />
        <SimpleButton
          width={250}
          onPress={onCloseClick}
          title={t('common.close')}
          titleColor={WHITE_COLOR}
          buttonColor={GRAY_COLOR}
          style={{ marginTop: 5 }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    flex: 1,
    paddingBottom: 40,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: 'center',
  },
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
  },
  _searchInput: {
    width: '88%',
    height: '100%',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  _inputView: {
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    width: '100%',
    height: 45,
    paddingLeft: 15,
    borderBottomWidth: 0,
  },
});

export default AddGroupModal;
