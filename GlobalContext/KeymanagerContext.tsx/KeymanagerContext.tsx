import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';

// Initial state definitions
interface KeymanagerState {
  controllersPermissions: ControllerPermission[];
  changedPermissions: Array<{ address: string, changed: string[] }>;
  isLoading: boolean;
  setControllersPermissions: React.Dispatch<React.SetStateAction<ControllerPermission[]>>;
  setChangedPermissions: React.Dispatch<React.SetStateAction<Array<{ address: string, changed: string[] }>>>;
}

const initialState: KeymanagerState = {
  controllersPermissions: [],
  changedPermissions: [],
  isLoading: false,
  setControllersPermissions: () => {},
  setChangedPermissions: () => {},
};

const KeymanagerContext = createContext(initialState);

interface AssetsProviderProps {
  children: ReactNode;
}

export const KeymanagerProvider: React.FC<AssetsProviderProps> = ({ children }) => {
  const { address, isConnected } = useAccount()

  const [isLoading, setIsLoading] = useState(false);

  // Existing permissions for given addresses
  const [controllersPermissions, setControllersPermissions] = useState<ControllerPermission[]>([]);
  // Adjusted permissions for given addresses
  const [changedPermissions, setChangedPermissions] = useState<Array<{ address: string, changed: string[] }>>([]);
  
  const fetchControllersPermissions = async () => {
    setIsLoading(true)
    const erc725 = new ERC725(LSP6Schema as ERC725JSONSchema[], address, 'https://rpc.testnet.lukso.gateway.fm');

    // Array of controller addresses on given UP
    const addressesWithPerm = await erc725.getData('AddressPermissions[]');
    console.log("addressesWithPerm", addressesWithPerm);
    
    const existingControllers = Array.isArray(addressesWithPerm.value) ? addressesWithPerm.value : [];

    const newControllersPermissions = [];

    for (const controllerAddress of existingControllers) {
      const addressPermission = await erc725.getData({
        keyName: 'AddressPermissions:Permissions:<address>',
        dynamicKeyParts: controllerAddress,
      });

      if (addressPermission && typeof addressPermission.value === 'string') {
        const decodedPermission = erc725.decodePermissions(addressPermission.value);
        newControllersPermissions.push({ 
          address: controllerAddress, 
          permissions: decodedPermission 
        });
      } else {
        console.error(`addressPermission.value for ${controllerAddress} is not a string or is null`);
      }
    }

    setControllersPermissions(newControllersPermissions);
    setChangedPermissions([]);
    setIsLoading(false)
  }

  // Fetch controllers & their permissions
  useEffect(() => {
    if (isConnected) {
      fetchControllersPermissions();
    }
  }, [address]);
  return (
    <KeymanagerContext.Provider value={{ controllersPermissions, changedPermissions, isLoading, setControllersPermissions, setChangedPermissions }}>
      {children}
    </KeymanagerContext.Provider>
  );
};

export const useKeymanager = () => useContext(KeymanagerContext);