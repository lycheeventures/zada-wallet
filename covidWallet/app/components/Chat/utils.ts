import { Platform } from 'react-native';
import Constants, { ZOHO_SALES_IQ_API_KEY } from '../../helpers/ConfigApp';
import { ZohoSalesIQ } from 'react-native-zohosalesiq-mobilisten';
import { _showAlert } from '../../helpers';

let ACCESS_KEY = '';
if (Platform.OS === 'ios') {
  ACCESS_KEY = Constants.ZOHO_SALES_IQ_IOS_ACCESS_KEY;
} else {
  ACCESS_KEY = Constants.ZOHO_SALES_IQ_ANDROID_ACCESS_KEY;
}

export const ZohoSalesIQOpenChat = () => {
  ZohoSalesIQ.initWithCallback(ZOHO_SALES_IQ_API_KEY, ACCESS_KEY, (success: any) => {
    if (success) {
      ZohoSalesIQ.openChat();
      // To show the default live chat launcher, you can use the setLauncherVisibility API.
      // Alternatively, you may use the 'Avail floating chat button for your app' option under Settings → Brands → Installation → Android/iOS.
    } else {
      _showAlert('ZADA WALLET', 'Failed to open chat right now, please try again later.');
    }
  });
};
