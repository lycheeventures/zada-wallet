import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity
} from 'react-native';

import { BACKGROUND_COLOR, BLACK_COLOR, PRIMARY_COLOR } from '../theme/Colors';
import WebView from 'react-native-webview';
import axios from 'axios';
import { _showAlert } from '../helpers/Toast';
import { _handleAxiosError } from '../helpers/AxiosResponse';
import OverlayLoader from './OverlayLoader';
import ConstantsList from '../helpers/ConfigApp';
import { getItem, saveItem } from '../helpers/Storage';
import Modal from 'react-native-modal';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import { add_kyc_session } from '../gateways/kyc';

const ZadaIdModal = ({ isVisible, onCloseCallback }) => {

    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState(null);

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
            console.log("SESSION", result.data);

            if (result.status == 200) {

                const userId = await getItem(ConstantsList.USER_ID);
                console.log("USER ID", userId);
                const kycResult = await add_kyc_session(result.data.id, userId);
                console.log('KYC REESULT', kycResult.data);
                if (kycResult.status == 200) {
                    setSessionData(result.data);
                    await saveItem(ConstantsList.ZIGN_SEC_TIME, (Math.round(Date.now() / 1000)).toString());
                }
                else {
                    onCloseCallback(kycResult);
                    setLoading(false);
                    setSessionData(null);
                }
            }
            else {
                _showAlert('ZADA Wallet', 'Unable to create session, please try again');
            }
            setLoading(false);
        } catch (error) {
            onCloseCallback(error);
            _showAlert('ZADA Wallet', 'Unable to create session, please try again');
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isVisible)
            _generateSession();
    }, [])

    return (
        <Modal
            isVisible={isVisible}
            onBackButtonPress={onCloseCallback}
            onBackdropPress={onCloseCallback}
            hideModalContentWhileAnimating={true}
            style={{
                margin: 0,
            }}
        >
            <SafeAreaView
                style={[styles._mainContainer, { backgroundColor: BACKGROUND_COLOR }]}
            >
                <View style={styles._header}>
                    <View style={styles._left} />
                    <Text style={styles._heading}>Get Zada ID</Text>
                    <View style={styles._right}>
                        <TouchableOpacity
                            onPress={onCloseCallback}
                        >
                            <EntypoIcon
                                name='circle-with-cross'
                                size={30}
                                color={PRIMARY_COLOR}

                            />
                        </TouchableOpacity>

                    </View>
                </View>
                <View style={styles._seperator} />
                <View style={styles._body}>
                    {
                        loading && sessionData == null ? (
                            <OverlayLoader
                                text='Generating Session...'
                            />
                        ) : (
                            <WebView
                                source={{ uri: sessionData.redirect_url }}
                                style={styles._webview}
                            />
                        )
                    }
                </View>

            </SafeAreaView>
        </Modal>

    )
}

const styles = StyleSheet.create({
    _mainContainer: {
        flex: 1,
    },
    _header: {
        paddingHorizontal: 15,
        height: 56,
        backgroundColor: BACKGROUND_COLOR,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    _left: {
        flex: 1,
    },
    _heading: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        color: BLACK_COLOR,
    },
    _right: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    _seperator: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    _body: {
        flex: 1,
    },
    _webview: {
        width: '100%',
        height: '100%',
    },
})

export default ZadaIdModal;