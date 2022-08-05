import axios from 'axios';
import Config from 'react-native-config';

Config
export default axios.create({
  baseURL: Config.API_URL,
  timeout: 15000,
});
