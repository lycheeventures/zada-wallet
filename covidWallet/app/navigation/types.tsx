import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { IConnectionList } from '../store/connections/interface';

export type AuthStackParamList = {
  PreferenceScreen: undefined;
  IntroScreen: undefined;
  WelcomeScreen: undefined;
  RegistrationScreen: undefined;
  LoginScreen: undefined;
  ForgotPasswordScreen: undefined;
  RecoveryPhraseScreen: undefined;
  ResetPasswordScreen: { metadata: string };
  ConsentScreen: undefined;
  PhoneNumberScreen: undefined;
  VerifyOTPScreen: undefined;
  PassCodeContainer: undefined;
  SecurityScreen: {
    navigation: NativeStackNavigationProp<AuthStackParamList>;
  };
  SecureidContainer: undefined;
  NotifyMeScreen: undefined;
  ConnectionListScreen: { connections: IConnectionList[] };
};

export type MainStackParamList = {
  MainScreen: undefined;
  SettingsScreen: undefined;
  LanguageSelectionScreen: undefined,
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
