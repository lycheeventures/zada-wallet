export const capitalizeFirstLetter = (str) => {
  if (!str) {
    str = '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const sortValuesByKey = (values) => {
  return Object.keys(values)
    .sort()
    .reduce((obj, key) => {
      obj[key] = values[key];
      return obj;
    }, {});
};
