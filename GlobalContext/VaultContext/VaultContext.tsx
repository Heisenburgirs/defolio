import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { VaultSchema } from '../../components/schema/DeployedVaults'
import { VaultName } from '../../components/schema/VaultName'
import { VaultDescription } from '../../components/schema/VaultDescription'
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json' assert { type: 'json' };
import LSP4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import LSP8DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import { Web3 } from 'web3';
import { ethers } from 'ethers';

// Initial state definitions
interface VaultObject {
  contract: string;
  name: string;
  desc: string;
  tokenBalances: TokenBalances;
  controllersPermissions: ControllerPermission[];
  changedPermissions: ControllerPermission[];
}

interface VaultData {
  vaults: VaultObject[];
  isLoading: boolean;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  setVaults: React.Dispatch<React.SetStateAction<VaultObject[]>>,
}

const initialState: VaultData = {
  vaults: [],
  isLoading: false,
  setIndex: () => {},
  setVaults: () => {},
};

const VaultContext = createContext<VaultData>(initialState);

interface VaultProviderProps {
  children: ReactNode;
}

export const VaultProvider: React.FC<VaultProviderProps> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [index, setIndex] = useState(0)

  const { data, isError } = useBalance({
    address: address,
  })

  const web3 = new Web3("https://rpc.testnet.lukso.network");

  const [vaults, setVaults] = useState<VaultObject[]>(initialState.vaults);

  useEffect(() => {

    const fetchVaults = async() => {
      setIsLoading(true)
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

          let tokenBalancesFinal;
          let lsp7Holdings = [];
          let lsp8Holdings = [];

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

            const erc725js = new ERC725(
              lsp3ProfileSchema as ERC725JSONSchema[], 
              vaultAddress, 
              'https://rpc.testnet.lukso.gateway.fm',
              {
                ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
              }
            );
          
            // Fetch assets data for this vault
            const receivedAssetsDataKey = await erc725js.fetchData('LSP5ReceivedAssets[]');
              
            if (Array.isArray(receivedAssetsDataKey.value)) {

              // Assuming receivedAssetsDataKey.value is an array of contract addresses
              const contractAddresses = receivedAssetsDataKey.value;
    
              for (const contractAddress of contractAddresses) {
                const myerc725 = new ERC725(LSP4Schema as ERC725JSONSchema[], contractAddress, "https://rpc.testnet.lukso.gateway.fm/", {
                  ipfsGateway: "https://api.universalprofile.cloud/ipfs"
                });
    
                const web3 = new Web3("https://rpc.testnet.lukso.network");
                const lsp7Contract = new web3.eth.Contract(
                  LSP7DigitalAsset.abi as any,
                  contractAddress
                );
    
                const lsp8Contract = new web3.eth.Contract(
                  LSP8DigitalAsset.abi as any,
                  contractAddress
                );
    
                // Fetching balance for the given user address (replace with actual user address)
                // @ts-ignore
                const balance = await lsp7Contract.methods.balanceOf(vaultAddress ).call();
    
                // Fetching token name and symbol
                const digitalAssetMetadataSymbol = await myerc725.fetchData('LSP4TokenSymbol');
                const digitalAssetMetadataName = await myerc725.fetchData('LSP4TokenName');
    
                try {
                  const decimals = await lsp7Contract.methods.decimals().call();
    
                  // @ts-ignore returns 18n (bigNumber) for some reason giving type error
                  const decimalsStr = decimals.toString();
                  
                  // @ts-ignore
                  if (decimalsStr === "18") {
                    lsp7Holdings.push({
                      contractAddress: contractAddress,
                      name: digitalAssetMetadataName.value,
                      symbol: digitalAssetMetadataSymbol.value,
                      balance: balance
                    });
                  } else if (decimalsStr === "1") {
                    lsp7Holdings.push({
                      contractAddress: contractAddress,
                      name: digitalAssetMetadataName.value,
                      symbol: digitalAssetMetadataSymbol.value,
                      balance: balance
                    });
                  }
                } catch (err) {
                  try {
                    // In case contract doesn't have decimals, we see if it ha balanceOf.
                    // If it does, it's LSP8
                    // @ts-ignore
                    const balanceOf = await lsp8Contract.methods.balanceOf(vaultAddress ).call();
      
                    // @ts-ignore
                    const balanceOfStr = balanceOf.toString()
      
                    // Set tokenID
                    // @ts-ignore
                    const tokenIdsBytes32 = await lsp8Contract.methods.tokenIdsOf(vaultAddress ).call();
      
                    //console.log("tokenIdsBytes32", tokenIdsBytes32)
                    
                    // @ts-ignore
                    const tokenIds = tokenIdsBytes32.map(bytes32 => bytes32ToNumber(bytes32).toString());
      
                    //console.log("tokenIds", tokenIds);
      
                    if (balanceOfStr >= "0") {
                      lsp8Holdings.push({
                        Address: contractAddress,
                        Name: typeof digitalAssetMetadataName.value === 'string' ? digitalAssetMetadataName.value : 'Unknown Token',
                        Symbol: typeof digitalAssetMetadataSymbol.value === 'string' ? digitalAssetMetadataSymbol.value : 'Unknown Symbol',
                        Price: '',
                        //@ts-ignore same void whathever bullshit
                        TokenAmount: balance.toString(),
                        TokenValue: '',
                        TokenID: tokenIds
                      });
                    }
                  } catch (err) {
                    console.log("ERROR FETCHING ASSETS")
                  }
                }
              }

              const balance = await web3.eth.getBalance(vaultAddress );
              const result = { address: vaultAddress , balance: balance };
              const balanceInEther = ethers.utils.formatEther(result.balance);
    
              const modifiedTokenBalances: TokenBalances = {
                LSP7: [
                  // Add the LYX token object first
                  {
                    Address: '0x',
                    Name: 'Lukso',
                    Symbol: 'LYX',
                    Price: '',
                    TokenAmount: balanceInEther.toString(),
                    TokenValue: '',
                    TokenID: [''] // Leave empty for now
                  },
                  // Then, add LSP7 holdings
                  ...lsp7Holdings.map(token => {
                    let tokenAmount = '0';
                    if (token.balance) {
                      tokenAmount = ethers.utils.formatEther(token.balance.toString());
                    }
                    
                    return {
                      Address: token.contractAddress,
                      Name: typeof token.symbol === 'string' ? token.symbol : 'Unknown Symbol',
                      Symbol: typeof token.symbol === 'string' ? token.symbol : 'Unknown Symbol',
                      Price: '', // Leave empty for now
                      TokenAmount: tokenAmount,
                      TokenValue: '', // Leave empty for now
                      TokenID: [''] // Leave empty for now
                    };
                  })
                ],
                LSP8: lsp8Holdings // Add LSP8 holdings
              };

              tokenBalancesFinal = modifiedTokenBalances;
          }
    
          const emptyTokenBalances: TokenBalances = {
            LSP7: [],
            LSP8: []
          };
          
          const erc725 = new ERC725(LSP6Schema as ERC725JSONSchema[], vaultAddress, 'https://rpc.testnet.lukso.gateway.fm');
        
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
                permissions: decodedPermission,
                isChanged: false
              });
            } else {
              console.error(`addressPermission.value for ${controllerAddress} is not a string or is null`);
            }
          }

          // Return a new VaultObject
          return {
            contract: vaultAddress,
            name: name,
            desc: desc,
            tokenBalances: tokenBalancesFinal || emptyTokenBalances,
            controllersPermissions: newControllersPermissions,
            changedPermissions: newControllersPermissions,
          };
        }));

        // set vault assets
        setVaults(vault);

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching vault data:", error);
      }
    }

    if (isConnected) {
      fetchVaults()
    }
  }, [address, isConnected, index])
  
  return (
    <VaultContext.Provider value={{ vaults, setVaults, isLoading, setIndex }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);