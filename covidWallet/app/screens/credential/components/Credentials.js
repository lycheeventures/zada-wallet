import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, FlatList, Dimensions, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { TextInput } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { themeStyles } from '../../../theme/Styles';
import { AppColors, PRIMARY_COLOR, WHITE_COLOR } from '../../../theme/Colors';
import phhLogo from '../../../assets/icons/phh-logo-color.png';
import zadaLogo from '../../../assets/icons/zada-logo-color.png';

import { CredentialAPI } from '../../../gateways';

import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchCredentialsStatus,
  selectSearchedCredentials,
  fetchCredentialsError,
} from '../../../store/credentials/selectors';
import { fetchCredentials } from '../../../store/credentials/thunk';
import useApiErrorHandler from '../../../hooks/useApiErrorHandler';
import FloatingActionButton from '../../../components/Buttons/FloatingActionButton';
import { selectUser } from '../../../store/auth/selectors';
import { selectDevelopmentMode, selectNetworkStatus } from '../../../store/app/selectors';
import { updateWebViewUrl } from '../../../store/app';
import EmptyCredentials from '../EmptyCredentials';
import CredentialCard from './CredentialCard';
import { _showAlert } from '../../../helpers';
import AppTooltip from '../../../components/tooltip/AppTooltip';
import useAppTooltip from '../../../hooks/useAppTooltip';
import { AppTooltipKeys } from '../../../helpers/AppTooltipKeys';

function Credentials(props) {
  // Constants
  const dispatch = useAppDispatch();
  const developmentMode = useAppSelector(selectDevelopmentMode);
  const user = useAppSelector(selectUser);

  // States
  const [search, setSearch] = useState('');
  const [loader, setLoader] = useState(false);

  // Selectors
  const { t } = useTranslation();
  const { initial, loading } = useAppSelector(fetchCredentialsStatus);
  const searchedCredentials = useAppSelector(state => selectSearchedCredentials(state, search));
  const networkStatus = useAppSelector(selectNetworkStatus);

  // show app tooltip
  const { activeStep, onNext, onSkip } = useAppTooltip({
    tooltipKey: AppTooltipKeys.CREDENTIALS_SCREEN,
    totalSteps: 1,
  });

  // Error Handling
  const error = useAppSelector(fetchCredentialsError);
  useApiErrorHandler(error);

  useFocusEffect(
    useCallback(() => {
      if (networkStatus !== 'connected') {
        _showAlert(t('errors.no_internet_title'), t('errors.no_internet_message'));
        return;
      }
      if (initial) {
        dispatch(fetchCredentials());
      }
    }, [initial, networkStatus])
  );

  // Pull to refresh
  const refreshHandler = () => {
    if (networkStatus !== 'connected') {
      _showAlert(t('errors.no_internet_title'), t('errors.no_internet_message'));
      return;
    }
    dispatch(fetchCredentials());
  };

  // Function
  const viewCredentialDetail = v => {
    props.navigation.navigate('CredDetailScreen', {
      credentialId: v.credentialId,
    });
  };

  // List Empty Component
  const emptyListComponent = () => (
    <EmptyCredentials
      title={t('EmptyCredentials.title')}
      message={t('EmptyCredentials.message')}
      iconName="folder"
    />
  );

  // List Header Component
  const listHeaderComponent = useMemo(
    () => (
      <View style={styles._searchContainer}>
        <TextInput
          placeholder={t('common.search')}
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
    let date = item.values['Issue Time'] ? item.values['Issue Time'] : item.issuedAtUtc;
    return (
      <CredentialCard
        credentialInfo={{
          imageUrl: item.imageUrl ?? '',
          title: item.type,
          subtitle: item.organizationName,
          issueDate: date,
        }}
        onPress={() => viewCredentialDetail(item)}
      />
    );
  };

  const onRequestCredentialPress = async () => {
    try {
      setLoader(true);
      let result = await CredentialAPI.get_uppass_url(user.phone);
      if (result.data.success) {
        dispatch(
          updateWebViewUrl({
            url: result.data.url,
            redirectUrl: `https://app.uppass.io/en/thankyou`,
          })
        );
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };
  const onRequestCovidPass = () => {
    Linking.openURL('https://PHH.covidpass.id');
  };
  const onRequestZadaCredential = () => {
    Linking.openURL('https://myzada.info');
  };

  return (
    <>
      <View style={themeStyles.mainContainer}>
        {loader && <OverlayLoader text="Please wait..." height={'100%'} width={'100%'} />}
        <FlatList
          refreshControl={
            <RefreshControl tintColor={'#7e7e7e'} refreshing={loading} onRefresh={refreshHandler} />
          }
          showsVerticalScrollIndicator={false}
          style={styles.flatListStyle}
          ListHeaderComponent={
            searchedCredentials.length > 0 || search.length > 0 ? listHeaderComponent : null
          }
          ListEmptyComponent={emptyListComponent}
          data={searchedCredentials}
          contentContainerStyle={styles.flatListContainerStyle}
          keyExtractor={(item, index) => item.credentialId + ':' + index.toString()}
          renderItem={renderItem}
        />
      </View>

      <View style={styles.floatingBtnContainerStyle}>
        <AppTooltip
          isVisible={activeStep === 1}
          message={t('tooltips.request_credential')}
          onNext={onNext}
          onSkip={onSkip}
          isLastStep={true}
          placement="bottom"
          spacing={-210}
          arrowSize={{ width: 0, height: 0 }}>
          <FloatingActionButton
            buttonColor={AppColors.PRIMARY}
            actionItems={
              developmentMode
                ? [
                    {
                      title: 'myzada.info',
                      onPress: onRequestZadaCredential,
                      imageSrc: zadaLogo,
                      buttonColor: AppColors.WHITE,
                    },
                    {
                      title: 'phh.covidpass.id',
                      onPress: onRequestCovidPass,
                      imageSrc: phhLogo,
                      buttonColor: AppColors.WHITE,
                    },
                    {
                      title: 'Add Credential',
                      onPress: onRequestCredentialPress,
                      iconName: 'badge-account-horizontal-outline',
                      buttonColor: AppColors.WHITE,
                    },
                  ]
                : [
                    {
                      title: 'myzada.info',
                      onPress: onRequestZadaCredential,
                      imageSrc: zadaLogo,
                      buttonColor: AppColors.WHITE,
                    },
                    {
                      title: 'phh.covidpass.id',
                      onPress: onRequestCovidPass,
                      imageSrc: phhLogo,
                      buttonColor: AppColors.WHITE,
                    },
                  ]
            }
          />
        </AppTooltip>
      </View>
    </>
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
  floatingBtnContainerStyle: {
    // bottom: height * 0.12,
    bottom: 8,
  },
});

export default Credentials;
