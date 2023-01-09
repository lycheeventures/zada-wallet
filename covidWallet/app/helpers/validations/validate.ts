import { constraints } from './constraints';
import { nameRegex, emailRegex, matchNothingRegex, passwordRegex } from './regex';

type IKey = 'name' | 'email' | 'password';

const getErrorMessage = (key: IKey, value: string) => {
  for (const k in constraints) {
    if (k === key) {
      if (value === '' && constraints[key].presense) {
        return constraints[key].presense.message;
      }
      return constraints[key].error.message;
    }
  }

  // If constraints are empty.
  return '';
};

const getRegex = (key: IKey) => {
  switch (key) {
    case 'name':
      return nameRegex;
    case 'email':
      return emailRegex;
    case 'password':
      return passwordRegex;
    default:
      return matchNothingRegex;
  }
};

export const validate = (key: IKey, value: string) => {
  let reg = getRegex(key);
  let error = getErrorMessage(key, value);
  if (!reg.test(value)) {
    return error;
  } else {
    return '';
  }
};
