import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Dimensions,
  View,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { BACKGROUND_COLOR, BLACK_COLOR, GRAY_COLOR, WHITE_COLOR } from '../../theme/Colors';
import { downloadFile, getCredentialTemplate, replacePlaceHolders, sharePDF } from './utils';
import {
  get_local_issue_date,
  parse_date_time,
  showAskDialog,
  showMessage,
  showNetworkMessage,
  _showAlert,
} from '../../helpers';
import { AppDispatch, RootState, useAppDispatch, useAppSelector } from '../../store';
import { deleteCredentialStatus, selectSingleCredential } from '../../store/credentials/selectors';

import OverlayLoader from '../../components/OverlayLoader';
import CredQRModal from './components/CredQRModal';
import DetailCard from './components/DetailCard';
import RenderValues from '../../components/RenderValues';
import usePreventScreenshot from '../../hooks/usePreventScreenshot';
import { compressCredentials, removeCredentials } from '../../store/credentials/thunk';
import { selectNetworkStatus } from '../../store/app/selectors';
import { ICredentialObject, ICredentialObjectValues } from '../../store/credentials/interface';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppTooltip from '../../components/tooltip/AppTooltip';
import useAppTooltip from '../../hooks/useAppTooltip';
import { AppTooltipKeys } from '../../helpers/AppTooltipKeys';

interface IProps {
  route: any;
  navigation: any;
}

const CredDetailScreen = (props: IProps) => {
  // Constants
  const credentialId = props.route.params.credentialId;
  const data =
    (useAppSelector((state: RootState) =>
      selectSingleCredential(state, credentialId)
    ) as ICredentialObject) || {}; // Credential Object

  const dispatch = useAppDispatch<AppDispatch>();
  const viewShotRef = useRef<ViewShot>(null);

  // Selectors
  const { t } = useTranslation();
  const credentialStatus = useAppSelector(deleteCredentialStatus);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // States
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGenerating, setGenerating] = useState(data?.qrCode === undefined ? true : false);
  const [isGeneratingPDF, setGeneratingPDF] = useState(false);

  const { activeStep, onNext, onSkip } = useAppTooltip({
    tooltipKey: AppTooltipKeys.CREDENTIAL_DETAIL_SCREEN,
    totalSteps: 3,
  });

  // Useeffects
  useEffect(() => {
    if (credentialStatus === 'success') {
      let message: string = t('messages.success_certificate_deletion');
      showMessage('ZADA Wallet', message);
      props.navigation.goBack();
    }
    if (credentialStatus === 'error') {
      let message: string = t('messages.failed_certificate_deletion');
      showMessage('ZADA Wallet', message);
    }
  }, [credentialStatus, props.navigation]);

  useEffect(() => {
    if (data.threadId) {
      if (data?.qrCode === undefined) {
        dispatch(compressCredentials(data.threadId));
      } else if (isGenerating) setGenerating(false);
    }
  }, [showQRModal, data?.qrCode]);

  // Make and Share PDF
  const createAndSharePDF = async (isDownload: boolean = false) => {
    // Return if internet is unavailable
    if (networkStatus === 'disconnected') {
      _showAlert(t('errors.no_internet_title'), t('errors.no_internet_message'));
      return;
    }
    setGeneratingPDF(true);
    try {
      // Ordering data
      const orderedData = (Object.keys(data.values) as (keyof ICredentialObjectValues)[])
        .sort()
        .reduce((obj: any, key) => {
          obj[key] = data.values[key];
          return obj;
        }, {});
      // Making html to be injected later as {key: value} pair.
      let credentialDetails = Object.keys(orderedData).map((key, index) => {
        let value = orderedData[key];
        value = parse_date_time(value);
        if (index % 3 === 0) {
          return `
          <tr>
          <td class="tds">
            <p class="pt">${key}: <strong>${value}</strong></p>
          </td>`;
        } else if ((index - 1) % 3 === 2) {
          return `</tr>`;
        } else {
          return `
          <td class="tds">
            <p class="pt">${key}: <strong>${value}</strong></p>
          </td>`;
        }
      });
      // Getting template
      let template = await getCredentialTemplate(data.schemaId, data.definitionId);

      // Capturing QR image using viewshot library.
      if (!viewShotRef.current || !viewShotRef.current.capture) {
        console.warn('ViewShot ref or capture method not ready');
        return;
      }
      const qrUrl = await viewShotRef.current.capture();

      // Injecting data into template
      let htmlStr = template.file;
      htmlStr = replacePlaceHolders(
        htmlStr,
        {
          ...orderedData,
          qrUrl,
          logo: data.imageUrl,
          type: data.type,
          organizationName: data.organizationName,
        },
        credentialDetails
      );

      if (isDownload && Platform.OS === 'android') {
        try {
          const result = await downloadFile(htmlStr, data.type ?? 'Credential');
          if (result?.success) {
            Alert.alert('Download Success', result.message, [{ text: 'OK' }]);
          }
        } catch (err: any) {
          Alert.alert('Error', err.message);
        } finally {
          setGeneratingPDF(false);
        }
      } else {
        await sharePDF(htmlStr, data.type ?? 'Credential');
      }
      setGeneratingPDF(false);
    } catch (error) {
      setGeneratingPDF(false);
    }
  };

  const openQRModal = async (bool: boolean) => {
    if (networkStatus === 'disconnected') {
      if (data?.qrCode === undefined) {
        _showAlert(t('errors.no_internet_title'), t('errors.no_internet_message'));
        return;
      }
    }
    setShowQRModal(bool);
  };

  const onDelete = () => {
    if (networkStatus === 'disconnected') {
      _showAlert(t('errors.no_internet_title'), t('errors.no_internet_message'));
      return;
    }
    showAskDialog('Are you sure?', t('messages.delete_certificate'), onConfirmDelete, () => {});
  };

  const onConfirmDelete = async () => {
    dispatch(removeCredentials(data.credentialId));
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={BLACK_COLOR} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('common.credential_detail')}</Text>

        <View style={styles.headerRightActions}>
          <AppTooltip
            isVisible={activeStep === 1}
            message={t('tooltips.download')}
            onNext={onNext}
            onSkip={onSkip}
            placement="bottom"
            spacing={-60}>
            <TouchableOpacity onPress={() => createAndSharePDF(true)}>
              <MaterialIcons name="download" size={26} style={styles.headerIcon} />
            </TouchableOpacity>
          </AppTooltip>

          <AppTooltip
            isVisible={activeStep === 2}
            message={t('tooltips.share')}
            onNext={onNext}
            onSkip={onSkip}
            placement="bottom"
            spacing={-60}>
            <TouchableOpacity onPress={() => createAndSharePDF(false)}>
              <MaterialIcons name="share" size={26} style={styles.headerIcon} />
            </TouchableOpacity>
          </AppTooltip>

          <AppTooltip
            isVisible={activeStep === 3}
            message={t('tooltips.delete')}
            onNext={onNext}
            onSkip={onSkip}
            isLastStep={true}
            placement="bottom"
            spacing={-60}>
            <TouchableOpacity onPress={onDelete}>
              <MaterialIcons name="delete" size={26} style={styles.headerIcon} />
            </TouchableOpacity>
          </AppTooltip>
        </View>
      </View>
      <View style={styles.hiddenQR}>
        {data.qrCode !== undefined && (
          <ViewShot ref={viewShotRef} options={{ fileName: 'QRCode', format: 'png', quality: 0.9 }}>
            <QRCode
              value={JSON.stringify(data.qrCode)}
              backgroundColor={BACKGROUND_COLOR}
              size={Dimensions.get('window').width * 0.7}
              ecl="L"
            />
          </ViewShot>
        )}
      </View>
      <View style={styles.innerContainer}>
        {credentialStatus === 'loading' && (
          <OverlayLoader text={t('messages.deleting_certificate')} />
        )}

        {isGeneratingPDF && <OverlayLoader text={t('messages.generating_new_pdf')} />}

        <CredQRModal
          isVisible={showQRModal}
          onCloseClick={() => {
            setShowQRModal(false);
          }}
          isGenerating={isGenerating}
          data={data.qrCode}
        />

        <View style={styles.topContainer}>
          {Object.keys(data).length > 0 && (
            <DetailCard
              item={data}
              issue_date={
                data?.values['Issue Time']
                  ? get_local_issue_date(data.values['Issue Time'])
                  : data.issuedAtUtc
                  ? get_local_issue_date(data.issuedAtUtc)
                  : undefined
              }
              organizationName={data.organizationName}
              setShowQRModal={openQRModal}
            />
          )}
        </View>

        <RenderValues
          listStyle={{ marginTop: 10 }}
          listContainerStyle={{ paddingBottom: '10%' }}
          inputTextColor={GRAY_COLOR}
          inputTextWeight="normal"
          inputTextSize={16}
          labelColor={BLACK_COLOR}
          values={data?.values ?? {}}
          inputBackground={WHITE_COLOR}
          width="100%"
          mainStyle={{}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 56,
    backgroundColor: BACKGROUND_COLOR,
  },
  backButton: { paddingLeft: 0, paddingRight: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: BLACK_COLOR,
    marginLeft: 10,
  },
  headerRightActions: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { padding: 8, color: BLACK_COLOR },
  topContainer: {
    margin: 8,
  },
  innerContainer: {
    borderRadius: 10,
    borderColor: BACKGROUND_COLOR,
    borderWidth: 1,
    backgroundColor: WHITE_COLOR,
    flex: 1,
  },
  headerRightIcon: {
    paddingRight: 15,
    color: BLACK_COLOR,
  },
  hiddenQR: { position: 'absolute', opacity: 0, pointerEvents: 'none' },
});
export default CredDetailScreen;
