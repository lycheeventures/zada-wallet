import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { analytics_log_show_cred_qr } from '../../helpers/analytics';
import { AppColors } from '../../theme/Colors';
import TouchableComponent from '../Buttons/TouchableComponent';
import CardBackground from '../CardBackground';

const DetailCard = ({ schemaId, imageUrl, issue_date, organizationName, setShowQRModal }) => {

    // Date
    let date = issue_date ? `Issued on ` + issue_date : '';

    // Functions
    const handleQRPress = () => {
        analytics_log_show_cred_qr()
        setShowQRModal(true)
    }

    // Issuer LOGO
    const issuerImage = () => {
        return (
            <View style={styles.issuerImageContainer}>
                <Image
                    resizeMode="contain"
                    source={{ uri: imageUrl }}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                />
            </View>
        )
    }

    return (
        <TouchableComponent onPress={handleQRPress}>
            <CardBackground schemeId={schemaId}>
                <View style={styles.issueTextContainerStyle}>
                    <Text style={styles.issueTextStyle}>{date}</Text>
                </View>

                <View style={styles._bottomContainer}>
                    <View style={styles._bottomInsideContainer}>
                        {issuerImage()}
                        <View style={styles._cardInfoContainer}>
                            <View>
                                <Text style={styles.card_small_text}>Issued by</Text>
                                <Text style={[styles.card_small_text, { fontWeight: 'bold' }]}>
                                    {organizationName}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View>
                        <View style={styles.touchableStyle}>
                            <View style={styles.touchableContainerStyle}>
                                <Image
                                    source={require('../../assets/images/qr-code.png')}
                                    style={styles.topContainerImage}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </CardBackground>
        </TouchableComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: "100%",
        borderRadius: 8,
    },
    issueTextContainerStyle: {
        marginTop: 8,
        height: 30,
        width: "100%",
        justifyContent: "center",
    },
    issueTextStyle: {
        alignSelf: "flex-end",
        color: "white",
        marginRight: 16,
    },
    _bottomContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        position: 'absolute',
        bottom: 16,
        paddingLeft: 16,
        paddingRight: 8,
    },
    _bottomInsideContainer: {
        flexDirection: 'row',
    },
    _cardLogo: {
        width: 60,
        height: 60,
        borderRadius: 4,
    },
    _cardInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 8,
    },
    card_small_text: {
        color: 'white',
    },
    issuerImageContainer: {
        height: 50,
        width: 50,
        alignItems: "center",
        justifyContent: "center"
    },
    topContainerImage: {
        height: 30,
        width: 30,
        tintColor: '#000000',
    },
    touchableStyle: {
        height: 45,
        width: 45,
        marginRight: 8,
        backgroundColor: "white",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    },
    touchableContainerStyle: {
        alignItems: "center",
        justifyContent: "space-between",
    },
    clickMeTextStyle: {
        fontSize: 10,
    }
})

export default DetailCard;