import React, { useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  TextInput,
  StyleSheet,
  View,
  RefreshControl,
  TouchableOpacity,
  Text,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import EmptyList from '../../../components/EmptyList';
import PullToRefresh from '../../../components/PullToRefresh';
import {
  add_credential_group,
  delete_credential_group,
  edit_credential_group,
  fetch_all_groups,
} from '../../../helpers/Credential_Groups';
import {
  AppColors,
  BLACK_COLOR,
  PRIMARY_COLOR,
  RED_COLOR,
  WHITE_COLOR,
} from '../../../theme/Colors';
import AddGroupModal from './AddGroupModal';
import { _showAlert } from '../../../helpers/Toast';
import { groupNameRegex } from '../../../helpers/validation';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CredentialsCard from '../../../components/CredentialsCard';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import EditGroupModal from './EditGroupModal';
import { _handleAxiosError } from '../../../helpers/AxiosResponse';
import { get_local_issue_date, parse_date_time } from '../../../helpers/time';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectCredentials } from '../../../store/credentials/selectors';
import { updateCredential } from '../../../store/credentials';
import FloatingActionButton from '../../../components/Buttons/FloatingActionButton';

const CredentialGroups = (props) => {
  // Constants
  const dispatch = useAppDispatch();

  // Selectors
  const { t } = useTranslation();
  const credentials = useAppSelector(selectCredentials.selectAll);

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [credentialGroups, setCredentialGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupNameError, setGroupNameError] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [selectedEditGroup, setSelectedEditGroup] = useState([]);

  const toggleModal = (v) => {
    props.navigation.navigate('CredDetailScreen', {
      credentialId: v.credentialId,
    });
  };

  // Dropdown Animation
  const [currentIndex, setCurrentIndex] = useState(-1);
  const ref = useRef(null);

  const updateBackgroundImage = (credentialId, background_url) => {
    dispatch(updateCredential({ id: credentialId, changes: { backgroundImage: background_url } }));
  };

  const _searchInputHandler = (searchText) => {
    setSearch(searchText);
    if (searchText != null && searchText.length != 0) {
      let searchCreds = [];
      credentialGroups.forEach((item) => {
        if (
          item.group_name != undefined &&
          item.group_name != '' &&
          item.group_name.toLowerCase().includes(searchText.toLowerCase())
        )
          searchCreds.push(item);
      });
      setFilteredGroups(searchCreds);
    } else {
      setFilteredGroups([]);
    }
  };

  const updateCredentialGroupList = async () => {
    try {
      // Getting item from asyncstorage
      let groups = await fetch_all_groups();
      setCredentialGroups(groups);
    } catch (error) {
      _showAlert('ZADA Wallet', error.message);
    }
  };

  const fetchGroupsAndCredentials = async () => {
    try {
      setRefreshing(true);
      // Getting item from asyncstorage
      let groups = await fetch_all_groups();
      setCredentialGroups(groups);
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      _handleAxiosError(error);
    }
  };

  const onCreateGroupClick = async (creds) => {
    try {
      if (!groupNameRegex.test(groupName)) {
        setGroupNameError(t('CredentialsScreen.group_name_error_message'));
        return;
      }
      setGroupNameError('');

      let selectedCreds = [];
      creds.forEach((item, index) => {
        if (item.selected) {
          selectedCreds.push(item);
        }
      });

      if (selectedCreds.length == 0) {
        _showAlert('ZADA Wallet', t('CredentialsScreen.select_credential_error_message'));
        return;
      }

      await add_credential_group(groupName, selectedCreds);
      await updateCredentialGroupList();
      setGroupName('');
      setGroupNameError('');
      setShowAddGroup(false);
    } catch (error) {
      _showAlert('ZADA Wallet', error.message);
    }
  };

  const onUpdateGroupClick = async (creds) => {
    try {
      if (!groupNameRegex.test(groupName)) {
        setGroupNameError(t('CredentialsScreen.group_name_error_message'));
        return;
      }
      setGroupNameError('');

      let selectedCreds = [];
      creds.forEach((item, index) => {
        if (item.selected) {
          selectedCreds.push(item);
        }
      });

      if (selectedCreds.length == 0) {
        _showAlert('ZADA Wallet', t('CredentialsScreen.select_credential_error_message'));
        return;
      }

      await edit_credential_group(groupName, selectedEditGroup, selectedCreds);
      await updateCredentialGroupList();
      setGroupName('');
      setGroupNameError('');
      setShowEditGroup(false);
    } catch (error) {
      _showAlert('ZADA Wallet', error.message);
    }
  };

  const onDeletePressed = async (group) => {
    try {
      await delete_credential_group(group);
      await updateCredentialGroupList();
    } catch (error) {
      _showAlert('ZADA Wallet', error.message);
    }
  };

  const showDeleteAlert = (group) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this group?',
      [
        {
          text: t('common.cancel'),
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: () => onDeletePressed(group),
          style: 'default',
        },
      ],
      {
        cancelable: true,
        onDismiss: () => { },
      }
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      updateCredentialGroupList();
    }, [])
  );

  return (
    <View ref={ref} style={styles._mainContainer}>
      <AddGroupModal
        isVisible={showAddGroup}
        credentials={credentials}
        groupName={groupName}
        groupNameError={groupNameError}
        onGroupNameChange={(text) => {
          setGroupName(text);
        }}
        onCreateGroupClick={onCreateGroupClick}
        onCloseClick={() => {
          setGroupName('');
          setGroupNameError('');
          setShowAddGroup(false);
        }}
        onRefresh={() => {
          fetchGroupsAndCredentials();
        }}
        refreshing={refreshing}
      />

      <EditGroupModal
        isVisible={showEditGroup}
        credentials={credentials}
        groupCredentials={selectedEditGroup.credentials ?? []}
        groupName={groupName}
        groupNameError={groupNameError}
        onGroupNameChange={(text) => {
          setGroupName(text);
        }}
        onUpdateGroupClick={onUpdateGroupClick}
        onCloseClick={() => {
          setGroupName('');
          setGroupNameError('');
          setShowEditGroup(false);
        }}
        onRefresh={() => {
          fetchGroupsAndCredentials();
        }}
        refreshing={refreshing}
      />

      <PullToRefresh />

      {credentialGroups.length > 0 ? (
        <>
          <View style={styles._searchContainer}>
            <TextInput
              placeholder={t('common.search')}
              value={search}
              onChangeText={_searchInputHandler}
              style={styles._searchInput}
            />
            <FeatherIcon name="search" size={24} color={PRIMARY_COLOR} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                tintColor={'#7e7e7e'}
                refreshing={refreshing}
                onRefresh={() => {
                  fetchGroupsAndCredentials();
                }}
              />
            }
            style={{
              flexGrow: 1,
            }}
            contentContainerStyle={{
              paddingBottom: '50%',
            }}>
            {search
              ? filteredGroups.map((group, index) => {
                const renderRightActions = (progress, dragX) => {
                  const trans = dragX.interpolate({
                    inputRange: [0, 50, 100, 101],
                    outputRange: [0, 5, 10, 15],
                  });
                  return (
                    <View style={styles._leftActionContainer}>
                      <Animated.View style={{ transform: [{ translateX: trans }] }}>
                        <TouchableOpacity
                          activeOpacity={0.9}
                          style={styles._actionButton}
                          onPress={() => {
                            setSelectedEditGroup(group);
                            setGroupName(group.group_name);
                            setShowEditGroup(true);
                          }}>
                          <FeatherIcon name="edit" color={PRIMARY_COLOR} size={24} />
                        </TouchableOpacity>
                      </Animated.View>

                      <Animated.View style={{ transform: [{ translateX: trans }] }}>
                        <TouchableOpacity
                          activeOpacity={0.9}
                          style={[styles._actionButton, { marginLeft: 4 }]}
                          onPress={() => {
                            showDeleteAlert(group);
                          }}>
                          <FeatherIcon name="trash" color={RED_COLOR} size={24} />
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  );
                };

                return (
                  <Swipeable renderRightActions={renderRightActions}>
                    <View style={styles._groupContainer}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                          setCurrentIndex(index === currentIndex ? -1 : index);
                          // if (ref != null) ref.current.animateNextTransition();
                        }}
                        style={styles._groupHeadingContainer}>
                        <View style={{ width: '90%' }}>
                          <Text style={styles._groupName}>{group.group_name}</Text>
                          <Text style={styles._groupDate}>
                            Created At: {parse_date_time(group.createdAt)}
                          </Text>
                        </View>
                        <FeatherIcon
                          name={
                            index === currentIndex ? 'chevron-down' : 'chevron-right'
                          }
                          size={24}
                          color={PRIMARY_COLOR}
                        />
                      </TouchableOpacity>
                      {index === currentIndex &&
                        group.credentials.map((cred, credIndex) => (
                          <TouchableOpacity
                            onPress={() => {
                              toggleModal(cred);
                            }}
                            key={credIndex.toString()}
                            style={styles._credentialsCardContainer}>
                            <CredentialsCard
                              updateBackgroundImage={updateBackgroundImage}
                              item={item}
                              schemeId={cred['schemaId']}
                              card_title={cred.name}
                              card_type={cred.type}
                              issuer={cred.organizationName}
                              card_user=""
                              date={
                                cred.values['Issue Time']
                                  ? get_local_issue_date(cred.values['Issue Time'])
                                  : undefined
                              }
                              card_logo={{ uri: cred.imageUrl }}
                            />
                          </TouchableOpacity>
                        ))}
                    </View>
                  </Swipeable>
                );
              })
              : credentialGroups.map((group, index) => {
                const renderRightActions = (progress, dragX) => {
                  const trans = dragX.interpolate({
                    inputRange: [0, 50, 100, 101],
                    outputRange: [0, 5, 10, 15],
                  });
                  return (
                    <View style={styles._leftActionContainer}>
                      <Animated.View style={{ transform: [{ translateX: trans }] }}>
                        <TouchableOpacity
                          activeOpacity={0.9}
                          style={styles._actionButton}
                          onPress={() => {
                            setSelectedEditGroup(group);
                            setGroupName(group.group_name);
                            setShowEditGroup(true);
                          }}>
                          <FeatherIcon name="edit" color={PRIMARY_COLOR} size={24} />
                        </TouchableOpacity>
                      </Animated.View>

                      <Animated.View style={{ transform: [{ translateX: trans }] }}>
                        <TouchableOpacity
                          activeOpacity={0.9}
                          style={[styles._actionButton, { marginLeft: 4 }]}
                          onPress={() => {
                            showDeleteAlert(group);
                          }}>
                          <FeatherIcon name="trash" color={RED_COLOR} size={24} />
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  );
                };

                return (
                  <Swipeable renderRightActions={renderRightActions}>
                    <View style={styles._groupContainer}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                          setCurrentIndex(index === currentIndex ? -1 : index);
                          // if (ref != null) ref.current.animateNextTransition();
                        }}
                        style={styles._groupHeadingContainer}>
                        <View style={{ width: '90%' }}>
                          <Text style={styles._groupName}>{group.group_name}</Text>
                          <Text style={styles._groupDate}>
                            Created At: {parse_date_time(group.createdAt)}
                          </Text>
                        </View>
                        <FeatherIcon
                          name={
                            index === currentIndex ? 'chevron-down' : 'chevron-right'
                          }
                          size={24}
                          color={PRIMARY_COLOR}
                        />
                      </TouchableOpacity>
                      {index === currentIndex &&
                        group.credentials.map((cred, credIndex) => (
                          <TouchableOpacity
                            onPress={() => {
                              toggleModal(cred);
                            }}
                            key={credIndex.toString()}
                            style={styles._credentialsCardContainer}>
                            <CredentialsCard
                              updateBackgroundImage={updateBackgroundImage}
                              item={cred}
                              schemeId={cred['schemaId']}
                              card_title={cred.name}
                              card_type={cred.type}
                              issuer={cred.organizationName}
                              card_user=""
                              date={
                                cred.values['Issue Time']
                                  ? get_local_issue_date(cred.values['Issue Time'])
                                  : undefined
                              }
                              card_logo={{ uri: cred.imageUrl }}
                            />
                          </TouchableOpacity>
                        ))}
                    </View>
                  </Swipeable>
                );
              })}
          </ScrollView>
        </>
      ) : (
        <EmptyList
          refreshing={refreshing}
          onRefresh={() => {
            fetchGroupsAndCredentials();
          }}
          text={t('CredentialsScreen.groups_empty_list_text')}
          image={require('../../../assets/images/credentialsempty.png')}
          style={{
            marginTop: 10,
          }}
        />
      )}

      <View style={{ bottom: Dimensions.get('screen').height * 0.12 }}>
        <FloatingActionButton
          buttonColor={AppColors.PRIMARY}
          onPress={() => {
            setShowAddGroup(true);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    flex: 1,
    paddingTop: 10,
  },
  _searchContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '95%',
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
  _groupContainer: {
    backgroundColor: WHITE_COLOR,
    alignSelf: 'center',
    width: '95%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    shadowColor: BLACK_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  _groupHeadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  _groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  _groupName: {
    width: '90%',
    fontSize: 18,
    color: PRIMARY_COLOR,
    fontFamily: 'Poppins-Regular',
  },
  _groupDate: {
    width: '90%',
    fontSize: 12,
    color: BLACK_COLOR,
    fontFamily: 'Poppins-Regular',
    opacity: 0.5,
    marginTop: 5,
  },
  _credentialsCardContainer: {
    paddingTop: 5,
  },
  _leftActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -5,
    marginLeft: 10,
  },
  _actionButton: {
    width: Dimensions.get('screen').width * 0.16,
    height: Dimensions.get('screen').width * 0.16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 5,
    borderRadius: 45,
    backgroundColor: WHITE_COLOR,
  },
});

export default CredentialGroups;
