export interface IAppState {
  status: 'idle' | 'loading' | 'pending' | 'succeeded' | 'failed';
  networkStatus: 'connected' | 'disconnected';
  developmentMode: boolean;
  isAppSetupComplete: boolean;
  baseUrl: string;
  webViewUrl: string | {
    url: string;
    redirectUrl: string;
  };
}
