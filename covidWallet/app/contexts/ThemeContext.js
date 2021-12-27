import React, { createContext, useLayoutEffect, useState } from "react";
import { LIGHT_THEME, DARK_THEME } from "../config/themes";
import { _setAsync, _getAsync } from "../utils/async";

const SELECTED_THEME = "selected_theme";

// Defining context
export const Context = createContext({
  theme: LIGHT_THEME,
  _toggleTheme: (theme) => { },
});

const ThemeContext = ({ children }) => {

  const [theme, setTheme] = useState(LIGHT_THEME);

  const _checkForTheme = async () => {
    try {
      const value = await _getAsync(SELECTED_THEME);
      if (value != null && value != undefined) {
        if (value === "light") setTheme(LIGHT_THEME);
        else setTheme(DARK_THEME);
      } else setTheme(LIGHT_THEME);
    } catch (error) {
      console.log("Theme Preferences error => ", error);
      setTheme(LIGHT_THEME);
    }
  };

  const _toggleTheme = async (theme) => {
    if (theme === "light") {
      setTheme(LIGHT_THEME);
      await _setAsync(SELECTED_THEME, "light");
    } else {
      setTheme(DARK_THEME);
      await _setAsync(SELECTED_THEME, "dark");
    }
  };

  useLayoutEffect(() => {
    _checkForTheme();
  }, []);

  return (
    <Context.Provider
      value={{
        theme: theme,
        _toggleTheme: _toggleTheme,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ThemeContext;
