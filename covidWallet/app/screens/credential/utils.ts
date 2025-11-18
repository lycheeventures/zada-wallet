import moment from 'moment';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import { CredentialAPI } from '../../gateways';
import { parse_date_time } from '../../helpers';

export const generatePDF = async (html: any, fileName: string) => {
  try {
    const options = {
      html,
      fileName,
      directory: 'Download',
      height: 842,
      width: 595,
      padding: 0,
    };

    const file = await RNHTMLtoPDF.convert(options);

    return { url: file.filePath };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const downloadFile = async (html: any, fileName: string) => {
  try {
    if (Platform.OS === 'android') {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Cannot save PDF without storage permission.');
        return;
      }
    }

    // Generate PDF into public Download folder
    const options = {
      html,
      fileName,
      directory: 'Download',
      height: 842,
      width: 595,
      padding: 0,
    };

    const file = await RNHTMLtoPDF.convert(options);
    const destPath = RNFetchBlob.fs.dirs.DownloadDir + `/${fileName}.pdf`;
    await RNFetchBlob.fs.cp(file.filePath, destPath);
    await RNFetchBlob.fs.scanFile([{ path: destPath }]);
    return { url: `file://${destPath}` };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Generating and sharing pdf
export const sharePDF = async (htmlStr: any, fileName: string) => {
  let result = await generatePDF(htmlStr, fileName);
  const shareOptions = {
    title: 'Credential',
    url: result.url,
  };
  try {
    await Share.open(shareOptions);
  } catch (error) {
    throw error;
  }
};

export const getCredentialTemplate = async (schemaId: string, credDef: string) => {
  try {
    let result = await CredentialAPI.get_credential_template(credDef);
    return result.data;
  } catch (e: any) {
    if (e.response.data.error === 'The specified key does not exist.') {
      // Get schema based template.
      try {
        let result = await CredentialAPI.get_credential_template(schemaId);
        return result.data;
      } catch (e: any) {
        if (e.response.data.error === 'The specified key does not exist.') {
          // Get default template.
          let result = await CredentialAPI.get_credential_template('default');
          return result.data;
        } else {
          console.log(e);
        }
      }
    } else {
      console.log(e);
    }
  }
};

export const replacePlaceHolders = (htmlStr: string, data: any, credentialDetails: any) => {
  Object.keys(data).forEach((e, i) => {
    htmlStr = htmlStr.replaceAll(
      '{placeholder_' + e.replaceAll(' ', '_').trim() + '}',
      parse_date_time(data[e])
    );
  });
  htmlStr = htmlStr.replaceAll(
    '{placeholder_pdfCreationDate}',
    parse_date_time(moment().format('YYYY-MM-DD[T]HH:mm:ss.SSSZ'))
  );
  htmlStr = htmlStr.replaceAll(
    '{placeholder_type}',
    data.Type ? data.Type : data.type ? data.type : 'Credential'
  );
  htmlStr = htmlStr.replaceAll('{placeholder_qr}', data.qrUrl);
  htmlStr = htmlStr.replaceAll('{placeholder_table}', credentialDetails.join(''));
  return htmlStr;
};

const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 33) {
      // Android > 11 uses READ_MEDIA_IMAGES
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      return true;
    } else {
      // Android < 11 uses WRITE_EXTERNAL_STORAGE
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'File Download Permission',
          message: 'Your permission is required to save files to your device.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.error('Storage permission error:', err);
    return false;
  }
};
