type IKey = 'UUID';

export const regex_uuid = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

export const regexTest = (key: IKey, value: string) => {
  switch (key) {
    case 'UUID':
      return regex_uuid.test(value);

    default:
      return null;
  }
};
