import { Platform } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { CredentialAPI } from '../../gateways';

export const generatePDF = async (html: any) => {
  let options = {
    html: html,
    fileName: 'ceritificate',
    directory: 'Documents',
  };
  let file = await RNHTMLtoPDF.convert(options);

  return { url: Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath };
};

export const getCredentialTemplate = async (credDef: string) => {
  try {
    let result = await CredentialAPI.get_credential_template(credDef);
    return result.data;
  } catch (e: any) {
    if (e.response.data.error === 'The specified key does not exist.') {
      let result = await CredentialAPI.get_credential_template('default');
      return result.data;
    } else {
      console.log(e);
    }
  }
};
