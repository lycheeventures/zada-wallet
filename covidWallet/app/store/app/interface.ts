export interface IAppState {
  status: 'idle' | 'loading' | 'pending' | 'succeeded' | 'failed';
  networkStatus: 'connected' | 'disconnected';
}
