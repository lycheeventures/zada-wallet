import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { analytics_log_show_cred_qr } from '../../helpers/analytics';
import { check_if_today, get_local_date, get_local_issue_date } from '../../helpers/time';
import { capitalizeFirstLetter } from '../../helpers/utils';
import { AppColors } from '../../theme/Colors';
import TouchableComponent from '../Buttons/TouchableComponent';

const DetailCard = ({ issue_date, organizationName, setShowQRModal }) => {

    // Today Check
    const date = check_if_today(issue_date) ? "today" : `on ${get_local_date(issue_date)}`

    // Functions
    const handleQRPress = () => {
        analytics_log_show_cred_qr()
        setShowQRModal(true)
    }

    // Alphabetic LOGO
    const alphabetLogo = () => {
        return (
            <View style={styles.alphabetContainer}>
                <Text style={styles.alphabetTextStyle}>
                    {capitalizeFirstLetter(organizationName.charAt(0))}
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.issueTextContainerStyle}>
                <Text style={styles.issueTextStyle}>issued {date}</Text>
            </View>

            <View style={styles._bottomContainer}>
                {alphabetLogo()}
                <View></View>
                <View style={styles._cardInfoContainer}>
                    <View
                        style={{
                            width: '60%',
                        }}>
                        <Text style={styles.card_small_text}>Issued by</Text>
                        <Text style={[styles.card_small_text, { fontWeight: 'bold' }]}>
                            {organizationName}
                        </Text>
                    </View>
                    <View>
                        <TouchableComponent
                            onPress={handleQRPress}
                            style={styles.touchableStyle}
                        >
                            <Image
                                source={require('../../assets/images/qr-code.png')}
                                style={styles.topContainerImage}
                            />
                        </TouchableComponent>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: "100%",
        borderRadius: 8,
        backgroundColor: AppColors.BLUE
    },
    issueTextContainerStyle: {
        marginTop: 8,
        height: 30,
        width: "100%",
        backgroundColor: AppColors.LIGHT_BLUE,
        justifyContent: "center",
    },
    issueTextStyle: {
        alignSelf: "flex-end",
        color: "white",
        marginRight: 8,
    },
    _bottomContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 20,
    },
    _cardLogo: {
        width: 60,
        height: 60,
        borderRadius: 4,
    },
    _cardInfoContainer: {
        width: '75%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 10,
    },
    card_small_text: {
        color: 'white',
    },
    alphabetContainer: {
        backgroundColor: AppColors.GRAY,
        height: 60,
        width: 60,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center"
    },
    alphabetTextStyle: {
        color: "white",
        fontSize: 24
    },
    topContainerImage: {
        width: '90%',
        height: '90%',
        tintColor: '#000000',
        position: 'absolute',
    },
    touchableStyle: {
        height: 45,
        width: 45,
        marginRight: 16,
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
    }
})

export default DetailCard;