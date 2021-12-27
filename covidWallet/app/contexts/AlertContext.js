import React, { createContext, useState } from "react";
import { AlertModal } from "../components";
import { ALERT_TYPES } from "../components/AlertModal";

export const Context = createContext({
  _showSuccessAlert: (
    alertInfo,
    alertButtonTitle,
    alertButtonCallback
  ) => { },
  _showErrorAlert: (
    alertInfo,
    alertButtonTitle,
    alertButtonCallback
  ) => { },
  _closeAlert: () => { },
  _showNetworkAlert: () => { },
});

const AlertContext = ({ children }) => {
  const [alertInfo, setAlertInfo] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [buttonTitle, setButtonTitle] = useState("");
  const [alertButtonCallback, setAlertButtonCallback] = useState(
    () => () => { }
  );

  const _closeAlert = () => {
    setShowAlert(false);
  };

  const _setFunction = (fn) => {
    setAlertButtonCallback(() => fn);
  };

  const _showSuccessAlert = (
    alertInfo,
    alertButtonTitle,
    alertButtonCallback
  ) => {
    setAlertType(ALERT_TYPES.SUCCESS);
    setAlertInfo(alertInfo ?? "Success message");
    setButtonTitle(alertButtonTitle ?? "Okay");
    _setFunction(alertButtonCallback ?? _closeAlert);
    setShowAlert(true);
  };

  const _showErrorAlert = (
    alertInfo,
    alertButtonTitle,
    alertButtonCallback
  ) => {
    setAlertType(ALERT_TYPES.ERROR);
    setAlertInfo(alertInfo ?? "Error message");
    setButtonTitle(alertButtonTitle ?? "Okay");
    _setFunction(alertButtonCallback ?? _closeAlert);
    setShowAlert(true);
  };

  const _showNetworkAlert = () => {
    setAlertInfo(
      "You are not connected with internet. Please check your internet connection and try again."
    );
    setAlertType(ALERT_TYPES.NETWORK);
    setButtonTitle("Okay");
    _setFunction(_closeAlert);
    setShowAlert(true);
  };

  return (
    <Context.Provider
      value={{
        _showSuccessAlert: _showSuccessAlert,
        _showErrorAlert: _showErrorAlert,
        _closeAlert: _closeAlert,
        _showNetworkAlert: _showNetworkAlert,
      }}
    >
      {children}
      <AlertModal
        isVisible={showAlert}
        buttonTitle={buttonTitle}
        closeCallback={_closeAlert}
        info={alertInfo}
        type={alertType}
        onButtonPress={alertButtonCallback}
      />
    </Context.Provider>
  );
};

export default AlertContext;
