import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { IConnectionList } from '../store/connections/interface';
import { RouteProp } from '@react-navigation/native';

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
  MigrationScreen: undefined;
};

export type MainStackParamList = {
  MainScreen: undefined;
  SettingsScreen: undefined;
  LanguageSelectionScreen: undefined;
  ContactUs: undefined;
  AboutUs: undefined;
  UserGuide: undefined;
  ProfileScreen: undefined;
  CredDetailScreen: { credentialId: string };
  QRScreen: undefined;
  EmptyCredentialScreen: undefined;
  CredentialListScreen: undefined;
  VerificationRequestScreen: {
    data: {
      metadata?: any;
      type?: string;
      imageUrl?: string;
      organizationName?: string;
      connectionId?: string;
      scanData?: string;
    };
  };
  ConnectionBaseVerificationScreen: undefined;
  CommonErrorView: undefined;
  NewQRScreen: undefined;
  ConnectionAccept: {
    qrJSON: any;
  };
  VerifyQRScreen: {
    credential: any;
    values: Array<{ key: string; value: string }>;
  };
};

export type TabStackParamList = {
  Actions: undefined;
  Credentials: undefined;
  Connections: undefined;
};

export type ICombinedParamList = AuthStackParamList & MainStackParamList & TabStackParamList;

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const TabStack = createBottomTabNavigator<TabStackParamList>();

export type MainStackNavigationProp = RouteProp<MainStackParamList, 'MainScreen'> & {
  state?: {
    index: number;
    routes: Array<{ name: keyof TabStackParamList }>;
  };
};
export { AuthStack, MainStack, TabStack };
