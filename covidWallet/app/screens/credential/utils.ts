import moment from 'moment';
import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import { CredentialAPI } from '../../gateways';
import { parse_date_time } from '../../helpers';

const { PdfDownload } = NativeModules;

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
    return { url: Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const downloadFile = async (html: any, fileName: string) => {
  try {
    // Convert PDF file
    const pdfResult = await RNHTMLtoPDF.convert({
      html,
      fileName,
      height: 842,
      width: 595,
      padding: 0,
    });

    const tempPath = pdfResult.filePath;
    if (!tempPath) throw new Error('Failed to generate PDF');

    if (Platform.OS === 'android') {
      if (Platform.Version >= 29) {
        // Android 10+ → MediaStore
        const msg = await PdfDownload.savePdfToDownloads(tempPath, fileName);
        return {
          success: true,
          message: `PDF downloaded successfully! You can find it in your device\’s Downloads folder.`,
        };
      } else {
        // Android 9 or below → Request permission
        const hasPermission = await requestLegacyStoragePermission();
        if (!hasPermission) {
          throw new Error('Cannot save PDF without storage permission.');
        }

        const destPath = RNFetchBlob.fs.dirs.DownloadDir + `/${fileName}.pdf`;
        await RNFetchBlob.fs.cp(tempPath, destPath);
        await RNFetchBlob.fs.scanFile([{ path: destPath }]);
        return {
          success: true,
          message: `PDF downloaded successfully! You can find it in your device\’s Downloads folder.`,
        };
      }
    }
  } catch (err: any) {
    throw new Error('Failed to generate or download PDF.');
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

const requestLegacyStoragePermission = async () => {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 29) return true; // Using Media Storage API

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'Permission is required to save PDF to Downloads folder.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Storage permission error:', err);
    return false;
  }
};
