import { useContext } from "react";
import { Context } from "../contexts/ThemeContext";

const useTheme = () => {
  const { theme, _toggleTheme } = useContext(Context);
  const { colors, isDark } = theme;
  return {
    colors,
    isDark,
    theme,
    _toggleTheme,
  };
};

export default useTheme;
