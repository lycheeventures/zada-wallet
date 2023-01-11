export type IStatus = 'idle' | 'loading' | 'pending' | 'succeeded' | 'failed';
export interface IUserState {
  isNew: boolean;
  id: Partial<string | undefined>;
  walletSecret: string | undefined;
  phone: string | undefined,
  type: 'demo' | undefined;
  auto_accept_connection: boolean;
  status: 'deleted' | 'inactive' | undefined;
}
export interface IAuthState {
  status: IStatus;
  isAuthorized: boolean;
  error: {
    code?: string | undefined;
    message?: string | undefined;
    name?: string | undefined;
    stack?: any;
  };
  token: string | undefined;
  user: IUserState;
}
