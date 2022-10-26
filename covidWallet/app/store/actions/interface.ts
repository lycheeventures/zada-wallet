export interface IActionState {
  status: 'idle' | 'loading' | 'pending' | 'succeeded' | 'failed';
  error: {
    code?: string | undefined;
    message?: string | undefined;
    name?: string | undefined;
    stack?: any;
  };
}

export interface IActionObject {
  connectionId: string;
  correlationId: string;
  credentialId: string;
  definitionId: string;
  schemaId: string;
  state: string;
  imageUrl: string;
  organizationName: string;
  type: string;
  values: {};
  verificationId?: string;
}
