import { useContext } from "react";
import { Context } from "../contexts/AlertContext";

const useAlert = () => {
  const {
    _showSuccessAlert,
    _showErrorAlert,
    _closeAlert,
    _showNetworkAlert,
  } = useContext(Context);
  return {
    _showSuccessAlert,
    _showErrorAlert,
    _closeAlert,
    _showNetworkAlert,
  };
};

export default useAlert;
