export type IStatus = 'idle' | 'loading' | 'pending' | 'succeeded' | 'failed';
export interface IUserState {
  isNew: boolean;
  id: Partial<string | undefined>;
  walletSecret: string | undefined;
  type: 'demo' | undefined;
  auto_accept_connection: boolean;
}
export interface IAuthState {
  status: IStatus;
  isAuthorized: boolean;
  error: string | undefined;
  token: string | undefined;
  user: IUserState;
  tempVar: IUserState;
}
