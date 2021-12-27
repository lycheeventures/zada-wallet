import { useContext } from "react";
import { Network } from "../contexts/NetworkContext";

const useNetwork = () => {

    const { isConnected } = useContext(Network);
    return { isConnected };
}

export default useNetwork;
