import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    SafeAreaView,
    StyleSheet,
    BackHandler,
    Text,
    Alert
} from 'react-native';
import { BACKGROUND_COLOR, PRIMARY_COLOR } from '../theme/Colors';
import WebView from 'react-native-webview';
import axios from 'axios';
import { _showAlert } from '../helpers/Toast';
import { _handleAxiosError } from '../helpers/AxiosResponse';
import OverlayLoader from '../components/OverlayLoader';
import ConstantsList from '../helpers/ConfigApp';
import { getItem, saveItem } from '../helpers/Storage';
import { add_kyc_session } from '../gateways/kyc';
import { AuthContext } from '../Navigation';

const ScanningDocument = ({ route }) => {

    const navigation = useNavigation();
    const { screen } = route.params;
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState(null);

    const _saveSession = async (id) => {
        try {
            const userId = await getItem(ConstantsList.USER_ID);
            const result = await add_kyc_session(id, userId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error };
        }
    }

    const _generateSession = async () => {
        try {
            setLoading(true);
            const result = await axios({
                url: `${ConstantsList.ZIGNSEC_TEST_URL}/scanning`,
                method: 'POST',
                headers: {
                    'Authorization': ConstantsList.ZIGNSEC_TEST_AUTH,
                },
                data: {
                    webhook: ConstantsList.ZIGNSEC_WEBHOOK,
                },
            });

            if (result.status == 200) {
                const sessionResult = await _saveSession(result.data.id);
                if (sessionResult.success) {
                    setSessionData(result.data);
                    await saveItem(ConstantsList.ZIGN_SEC_TIME, (Math.round(Date.now() / 1000)).toString());
                    setLoading(false);
                }
                else {
                    setLoading(false);
                    _showAlert('ZADA Wallet', 'Unable to create session, please try again');
                }
            }
            else {
                setLoading(false);
                _showAlert('ZADA Wallet', 'Unable to create session, please try again');
            }
        } catch (error) {
            _showAlert('ZADA Wallet', 'Unable to create session, please try again');
            setLoading(false);
        }
    }

    const _handleBackPress = async () => {
        if (screen !== 'settings') {
            navigation.replace('SecurityScreen')
        }
        else {
            navigation.goBack();
        }
    }

    const _exitConfirmAlert = () => {
        Alert.alert(
            'Confirmation',
            'Are you sure you want to quit this process?',
            [
                {
                    text: 'Yes',
                    onPress: () => { _handleBackPress() }
                },
                {
                    text: 'No',
                    onPress: () => { },
                    style: 'cancel',
                }
            ],
            {
                cancelable: true,
            }
        )
    }

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => null,
            headerRight: () => (
                <Text onPress={() => { _exitConfirmAlert() }} style={styles._finish}>Finish</Text>
            )
        });

        BackHandler.addEventListener('hardwareBackPress', async () => {
            _exitConfirmAlert();

        });

        return (() => {
            BackHandler.removeEventListener('hardwareBackPress');
        })
    }, [])

    useEffect(() => {
        _generateSession();
    }, [])
    return (
        <SafeAreaView
            style={[styles._mainContainer, { backgroundColor: BACKGROUND_COLOR }]}
        >
            {
                loading && sessionData == null ? (
                    <OverlayLoader
                        text='Generating Session...'
                    />
                ) : (
                    <WebView
                        source={{ uri: sessionData && sessionData.redirect_url }}
                        style={styles._webview}
                    />
                )
            }

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    _mainContainer: {
        flex: 1,
    },
    _webview: {
        flex: 1,
    },
    _finish: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        fontWeight: 'bold',
        color: PRIMARY_COLOR,
        marginRight: 15,
    },
})

export default ScanningDocument;
