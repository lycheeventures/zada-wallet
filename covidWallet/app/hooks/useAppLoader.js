import { useContext } from "react";
import { Context } from "../contexts/LoadingContext";

const useAppLoader = () => {
    const { _closeAppLoader, _showAppLoader } = useContext(Context);

    return {
        _closeAppLoader, _showAppLoader
    };
};

export default useAppLoader;
