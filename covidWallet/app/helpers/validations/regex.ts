export const matchNothingRegex = RegExp('(.*?)');
export const emailRegex = RegExp('^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$');
export const nameRegex = RegExp('^[a-zA-Z\\s]{2,100}$');
export const passwordRegex = RegExp('^.{6,30}$');
