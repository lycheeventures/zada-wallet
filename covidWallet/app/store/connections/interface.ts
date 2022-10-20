export type IStatus = 'idle' | 'loading' | 'pending' | 'succeeded' | 'failed';

export interface IConnectionState {
  status: IStatus;
  error: {
    code?: string | undefined;
    message?: string | undefined;
    name?: string | undefined;
    stack?: any;
  };
}

interface IEndpoint {
  uri: string;
  verkey: string;
}

export interface IConnectionObject {
  connectionId: string;
  createdAtUtc: Date;
  endpoint: IEndpoint;
  imageUrl: string;
  multiParty: boolean;
  myDid: string;
  myKey: string;
  name: string;
  state: string;
  theirDid: string;
  theirKey: string;
}
