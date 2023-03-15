import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { ICredentialObject } from '../store/credentials/interface';

export type AuthStackParamList = {
  IntroScreen: undefined;
  WelcomeScreen: undefined;
  RegistrationScreen: undefined;
  LoginScreen: undefined;
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { metadata: string };
  MultiFactorScreen: { from: 'Register' | 'Login'; user: Object };
  OTPScreen: { headingText: string; sendCode: () => void; validateOTP: () => void };
  PassCodeContainer: undefined;
  SecurityScreen: {
    navigation: NativeStackNavigationProp<AuthStackParamList>;
    user: Object;
  };
  SecureidContainer: undefined;
  NotifyMeScreen: { user: Object };
};

export type MainStackParamList = {
  MainScreen: undefined;
  SettingsScreen: undefined;
  ContactUs: undefined;
  AboutUs: undefined;
  ProfileScreen: undefined;
  CredDetailScreen: { credentialId: string };
  QRScreen: undefined;
};

export type TabStackParamList = {
  Actions: undefined;
  Certificates: undefined;
  Connections: undefined;
};

export type ICombinedParamList = AuthStackParamList & MainStackParamList & TabStackParamList;

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const TabStack = createBottomTabNavigator<TabStackParamList>();

export type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export { AuthStack, MainStack, TabStack };
