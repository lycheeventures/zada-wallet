export const constraints = {
  name: {
    presense: {
      message: 'Please enter name.',
    },
    error: {
      message:
        'Please enter a name between 2-200 alphabetical characters long. No numbers or special characters.',
    },
  },
  password: {
    presense: {
      message: 'Please enter password.',
    },
    error: {
      message: 'Password length should be 6 to 30 characters',
    },
  },
  email: {
    presense: {
      message: 'Please enter email.',
    },
    error: {
      message: 'Please enter correct email.',
    },
  },
};
