import { updateToken } from '.';
import { getToken } from '../../gateways/auth';
import { getItem } from '../../helpers/Storage';
import ConstantList from '../../helpers/ConfigApp';

export const fetchToken = () => async (dispatch: any) => {
  try {
    // Getting Token
    let userId = JSON.stringify((await getItem(ConstantList.USER_ID)) || null);

    // Return if first time is true.
    if (!userId) {
      dispatch(updateToken(undefined));
      return;
    }

    let response = await getToken();
    if (response == '') {
      response = undefined;
    }
    dispatch(updateToken(response));
  } catch (e) {
    return console.error(e);
  }
};
