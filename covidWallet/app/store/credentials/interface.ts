export interface ICredentialState {
  //status: 'initial' | 'loading' | 'pending' | 'success' | 'error';
  fetchCredentials: 'initial' | 'loading' | 'success' | 'error';
  addCredential: 'initial' | 'loading' | 'success' | 'error';
  deleteCredential: 'initial' | 'loading' | 'success' | 'error';
  error: {
    code?: string | undefined;
    message?: string | undefined;
    name?: string | undefined;
    stack?: any;
  };
}

export interface ICredentialObjectValues {
  'Administrating Center': string;
  'Birth Date': string;
  Country: string;
  'Document Id': string;
  'Document Type': string;
  Dose: string;
  'Full Name': string;
  Gender: string;
  'Issue Time': string;
  Nationality: string;
  'Staff Name': string;
  'Vaccination Certificate Issuer': string;
  'Vaccine Manufacturer': string;
  'Vaccine Name': string;
  'Virus Name': string;
  Type: string;
}

export interface ICredentialObject {
  acceptedAtUtc: Date;
  connectionId: string;
  correlationId: string;
  credentialId: string;
  threadId: string;
  definitionId: string;
  issuedAtUtc: Date;
  schemaId: string;
  imageUrl: string;
  state: string;
  values: ICredentialObjectValues;
  type: string;
  qrCode: {
    d: string;
    i: string;
    type: string;
    v: Number;
  };
  organizationName?: string;
  selected?: boolean;
}

export interface Action {
  state: string;
  credentialId: string;
  connectionId: string;
  threadId: string;
  issuedAtUtc: string;
  values: {
    [key: string]: string;
  };
  correlationId: string;
}
