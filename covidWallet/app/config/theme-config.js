import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { Platform, Dimensions } from "react-native";

export const PLATFORM = Platform;
export const MOBILE_WIDTH = Dimensions.get("screen").width;
export const MOBILE_HEIGHT = Dimensions.get("screen").height;

export const THEME_CONFIG = {
    PLATFORM: Platform,
    MOBILE_WIDTH: Dimensions.get("screen").width,
    MOBILE_HEIGHT: Dimensions.get("screen").height,
    WP: wp,
    HP: hp,
    SPACINGS: {
        spacing_5: 5,
        spacing_10: 10,
        spacing_12: 12,
        spacing_15: 15,
        spacing_20: 20,
        spacing_25: 25,
        spacing_30: 30,
    },
    RADIUS: {
        radius_5: 5,
        radius_10: 10,
        radius_12: 12,
        radius_15: 15,
        radius_20: 20,
        radius_25: 25,
        radius_30: 30,
    },
    FONT_SIZES: {
        size_10: RFValue(10),
        size_11: RFValue(11),
        size_12: RFValue(12),
        size_14: RFValue(14),
        size_16: RFValue(16),
        size_18: RFValue(18),
        size_20: RFValue(20),
        size_22: RFValue(22),
        size_24: RFValue(24),
        size_26: RFValue(26),
        size_28: RFValue(28),
    },
    ICON_SIZES: {
        size_6: 6,
        size_10: 10,
        size_18: 18,
        size_20: 20,
        size_22: 22,
        size_24: 24,
        size_26: 26,
        size_28: 28,
        size_30: 30,
    },
    FONT_FAMILIES: {
        Poppins: {
            Regular: "Poppins-Regular",
            Medium: "Poppins-Medium",
            SemiBold: "Poppins-SemiBold",
            Bold: "Poppins-Bold",
        },
        Merriweather: {
            Bold: "Merriweather-Bold",
        },
    },
};

export const KEYBOARD_VERTICAL_OFFSET = PLATFORM.OS == "ios" ? 100 : 0;
export const KEYBOARD_BEHAVIOR = PLATFORM.OS == "ios" ? "padding" : null;
