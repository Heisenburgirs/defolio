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
}

const initialState: VaultData = {
  vaults: [],
};

const VaultContext = createContext<VaultData>(initialState);

interface VaultProviderProps {
  children: ReactNode;
}

export const VaultProvider: React.FC<VaultProviderProps> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const [vaults, setVaults] = useState<VaultObject[]>(initialState.vaults);

  useEffect(() => {

    const fetchVaults = async() => {
      // Get all deployed vaults
      const vaultAddresses = new ERC725(VaultSchema, address, "https://rpc.testnet.lukso.network");
      const fetchAddress = await vaultAddresses.fetchData(`VaultsDeployed[]`)
      console.log("DATA FETCHED", fetchAddress)

      // Get vault names
      const vaultNames = new ERC725(VaultName, address, "https://rpc.testnet.lukso.network");
      const fetchName = await vaultNames.fetchData({keyName: "VaultName:<address>", dynamicKeyParts: "0x4899eC2046B60C4Dd29eB5B148A97AA47d93e210"})
      console.log("DATA FETCHED", fetchName)

      const vaultDesc = new ERC725(VaultDescription, address, "https://rpc.testnet.lukso.network");
      const fetchDesc = await vaultDesc.fetchData({keyName: "VaultDescription:<address>", dynamicKeyParts: "0x4899eC2046B60C4Dd29eB5B148A97AA47d93e210"})
      console.log("DATA FETCHED", fetchDesc)
    }

    if (isConnected) {
      fetchVaults()
    }
  }, [address])
  
  return (
    <VaultContext.Provider value={{ vaults }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);