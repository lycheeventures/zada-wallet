export const nameRegex = RegExp('^[a-zA-Z\\s]{2,1000}$');
export const groupNameRegex = RegExp('^[a-zA-Z\\s]{2,1000}$');

export const pincodeRegex = RegExp('^([0-9]{6})$');

//8-15 letters, 1 number, Capital letter, 1 special character
// export const passwordRegex = RegExp(
//   '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,16}$',
// );

export const emailRegex = RegExp(
  '^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$',
);

export const validateIfLowerCased = (text: string) => {
  const reg = RegExp('([a-zA-Z])');
  let i = 0;
  let isLowerCased = true;
  while (i < text.length) {
    let character = text.charAt(i);
    if (reg.test(character)) {
      if (character == character.toUpperCase()) {
        isLowerCased = false;
      }
    }
    i++;
  }
  return isLowerCased;
};

export const validateLength = (text: string) => {
  if (text.length < 4 || text.length > 30) {
    return true;
  }
};
