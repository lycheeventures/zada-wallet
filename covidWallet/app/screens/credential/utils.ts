import moment from 'moment';
import { Platform } from 'react-native';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { CredentialAPI } from '../../gateways';
import { parse_date_time } from '../../helpers';

export const generatePDF = async (html: any) => {
  let options = {
    html: html,
    fileName: 'credential',
    directory: 'Documents',
    padding: 0,
    height: 842,
    width: 595,
  };
  let file = await RNHTMLtoPDF.convert(options);

  return { url: Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath };
};

// Generating and sharing pdf
export const sharePDF = async (htmlStr: any) => {
  let result = await generatePDF(htmlStr);
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
      '[placeholder_' + e.replaceAll(' ', '_').trim() + ']',
      parse_date_time(data[e])
    );
  });
  htmlStr = htmlStr.replaceAll(
    'placeholder_pdfCreationDate',
    parse_date_time(moment().format('YYYY-MM-DD[T]HH:mm:ss.SSSZ'))
  );
  htmlStr = htmlStr.replaceAll(
    'placeholder_type',
    data.Type ? data.Type : data.type ? data.type : 'Credential'
  );
  htmlStr = htmlStr.replaceAll('placeholder_qr', data.qrUrl);
  htmlStr = htmlStr.replaceAll('placeholder_table', credentialDetails.join(''));
  return htmlStr;
};
