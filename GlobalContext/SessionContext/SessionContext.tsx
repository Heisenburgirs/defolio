import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { SessionKeys } from '@/components/schema/SessionKeys';
import { ethers } from 'ethers';
import SessionKeysContract from '../../contracts/SessionAbi.json'

interface SessionedAddress {
  address: string,
  startTime: string,
  session: string,
  isExpired: boolean;
}

interface SessionKeysAddresses {
  sessionAddress: string[] | undefined;
  sessionedAddresses: SessionedAddress[] | undefined;
  isLoading: boolean;
  setIndexKey: React.Dispatch<React.SetStateAction<number>>;
}

const initialState: SessionKeysAddresses = {
  sessionAddress: [],
  sessionedAddresses: [],
  isLoading: true,
  setIndexKey: () => {},
};

const SessionKeysContext = createContext(initialState);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionKeysprovider: React.FC<SessionProviderProps> = ({ children }) => {
  const { address, isConnected } = useAccount()
  const [indexKey, setIndexKey] = useState(0)

  const [sessionAddress, setSessionAddress] = useState<string[] | undefined>()
  const [sessionedAddresses, setSessionedAddresses] = useState<SessionedAddress[]>()

  const [isLoading, setIsLoading] = useState(false);

  const erc725 = new ERC725(
    SessionKeys,
    address,
    'https://rpc.testnet.lukso.network'
  );

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString('en-US', { hour12: true });
  }
  
  const fetchSessionKeys = async () => {
    setIsLoading(true)
    const provider = new ethers.providers.Web3Provider(window.lukso);
    
    const signer = provider.getSigner();
    const sessionKeysAddresses = await erc725.getData('SessionKeys[]');
    console.log("sessionKeysAddresses", sessionKeysAddresses);

    console.log(sessionKeysAddresses.value)

    let addresses: string[] = [];
    if (Array.isArray(sessionKeysAddresses.value)) {
      addresses = sessionKeysAddresses.value;
    } else if (typeof sessionKeysAddresses.value === 'string') {
      addresses = [sessionKeysAddresses.value]; // If it's a single string, make it an array
    }

    if (addresses && addresses.length === 0) {
      setSessionAddress(addresses)
      setIsLoading(false)
    } else {

    const contractInstace = new ethers.Contract(addresses[0], SessionKeysContract.abi, signer)

    const getSessionedAddresses = await contractInstace.getAllGrantedSessionAddresses()

    const allSessionedAddresses = [];

    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds

    for (const address of getSessionedAddresses) {
      const sessionData = await contractInstace.sessions(address);
  
      const sessionStart = parseInt(sessionData[0].toString(), 10); // Session start time in seconds
      const sessionDuration = parseInt(sessionData[1].toString(), 10); // Session duration in seconds
      const sessionEnd = sessionStart + sessionDuration; // Calculate session end time
  
      const isExpired = currentTimestamp > sessionEnd; // Check if current time is past session end time
  
      const sessionObj = {
          address: address,
          startTime: formatTimestamp(sessionStart), // Convert start time to formatted string
          session: formatTimestamp(sessionEnd),    // Convert end time to formatted string
          isExpired: isExpired,
      };
      allSessionedAddresses.push(sessionObj);
    }

    setSessionedAddresses(allSessionedAddresses)
    setSessionAddress(addresses)
    setIsLoading(false)
    }
  }

  // Fetch addresses with permissions
  useEffect(() => {
    if (isConnected) {
      fetchSessionKeys();
    }
  }, [address, isConnected, indexKey]);
  
  return (
    <SessionKeysContext.Provider value={{ setIndexKey, sessionAddress, sessionedAddresses, isLoading }}>
      {children}
    </SessionKeysContext.Provider>
  );
};

export const useSessionKeys = () => useContext(SessionKeysContext);