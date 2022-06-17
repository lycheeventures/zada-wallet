import { useContext } from "react";
import { Network } from "../context/NetworkContext";
import NetInfo from '@react-native-community/netinfo';


const useNetwork = () => {

    const { isConnected } = useContext(Network);

    return { isConnected };
}

export default useNetwork;
