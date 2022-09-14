export type IStatus = 'idle' | 'loading' | 'pending' | 'succeeded' | 'failed';
export interface IUserState {
  isNew: boolean;
  id: Partial<string | undefined>;
  walletSecret: string | undefined;
  type: 'demo' | undefined;
}
export interface IAuthState {
  status: IStatus;
  isAuthorized: boolean;
  error: string | undefined;
  token: string | undefined;
  user: IUserState;
  tempVar: IUserState;
}
