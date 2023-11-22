import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { VaultSchema } from '../../components/schema/DeployedVaults'
import { VaultName } from '../../components/schema/VaultName'
import { VaultDescription } from '../../components/schema/VaultDescription'

// Initial state definitions
interface VaultObject {
  contract: string;
  name: string;
  desc: string;
}

interface VaultData {
  vaults: VaultObject[];
  tokenBalances: TokenBalances;
}

const initialState: VaultData = {
  vaults: [],
  tokenBalances: {
    LSP7: [],
    LSP8: []
  },
};

const VaultContext = createContext<VaultData>(initialState);

interface VaultProviderProps {
  children: ReactNode;
}

export const VaultProvider: React.FC<VaultProviderProps> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const [vaults, setVaults] = useState<VaultObject[]>(initialState.vaults);
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({ LSP7: [], LSP8: [] });

  useEffect(() => {

    const fetchVaults = async() => {

      try {
        // Fetch all vault addresses
        const vaultAddresses = new ERC725(VaultSchema, address, "https://rpc.testnet.lukso.network");
        const fetchAddressResponse = await vaultAddresses.fetchData(`VaultsDeployed[]`);
        let addresses: string[] = [];
        if (Array.isArray(fetchAddressResponse.value)) {
          addresses = fetchAddressResponse.value;
        } else if (typeof fetchAddressResponse.value === 'string') {
          addresses = [fetchAddressResponse.value]; // If it's a single string, make it an array
        }

        // Prepare to fetch details for each vault
        const vaultNames = new ERC725(VaultName, address, "https://rpc.testnet.lukso.network");
        const vaultDesc = new ERC725(VaultDescription, address, "https://rpc.testnet.lukso.network");
  
        // Use Promise.all to handle asynchronous operations for each address
        const vault = await Promise.all(addresses.map(async (vaultAddress: string) => {
          // Fetch name for the vault
          const fetchNameResponse = await vaultNames.fetchData({keyName: "VaultName:<address>", dynamicKeyParts: vaultAddress});
          let name = '';
          if (typeof fetchNameResponse.value === 'string') {
            name = fetchNameResponse.value;
          }

          // Fetch description for the vault
          const fetchDescResponse = await vaultDesc.fetchData({keyName: "VaultDescription:<address>", dynamicKeyParts: vaultAddress});
          let desc = '';
          if (typeof fetchDescResponse.value === 'string') {
            desc = fetchDescResponse.value;
          }

          // Return a new VaultObject
          return {
            contract: vaultAddress,
            name: name,
            desc: desc
          };
        }));
    
        // Update the state with the new array of VaultObjects
        setVaults(vault);
        //setTokenBalances(modifiedTokenBalances);

      } catch (error) {
        console.error("Error fetching vault data:", error);
      }
    }

    if (isConnected) {
      fetchVaults()
    }
  }, [address, isConnected])
  
  return (
    <VaultContext.Provider value={{ vaults, tokenBalances }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);