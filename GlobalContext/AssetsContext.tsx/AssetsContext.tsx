import { useCurrencyData } from '@/components/context/CurrencyContext';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAccount, useBalance } from 'wagmi';

import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json' assert { type: 'json' };
import LSP4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import { Web3 } from 'web3';
import { ethers } from 'ethers';

// AssetsState Interface
interface AssetsState {
  isLoading: boolean;
  convertedBalances: { USD: number; GBP: number; EUR: number };
  convertedLYXPrice: { USD: number; GBP: number; EUR: number };
  tokenBalances: TokenBalances;
}

const initialState: AssetsState = {
  isLoading: true,
  convertedBalances: { USD: 0, GBP: 0, EUR: 0 },
  convertedLYXPrice: { USD: 0, GBP: 0, EUR: 0 },
  tokenBalances: [],
};

const AssetsContext = createContext(initialState);

interface AssetsProviderProps {
  children: ReactNode;
}

export const AssetsProvider: React.FC<AssetsProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [convertedBalances, setConvertedBalances] = useState<{ USD: number; GBP: number; EUR: number }>({USD: 0, GBP: 0, EUR: 0,});
  const [convertedLYXPrice, setConvertedLYXPrice] = useState<{ USD: number; GBP: number; EUR: number }>({USD: 0, GBP: 0, EUR: 0,});
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>([]);

  const { address, isConnected, isDisconnected } = useAccount()
  
  const { data, isError } = useBalance({
    address: address,
  })
  
  const { currencyData, error, loading } = useCurrencyData();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/coinmarketcap');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responsePrice = await response.json();

        const lyxPrice = Number(responsePrice)
        const balanceValue = data?.formatted && !isNaN(Number(data.formatted)) 
        ? Number(data.formatted) 
        : 0;
        const totalPriceLYX = balanceValue * lyxPrice;

        setConvertedBalances({
          USD: Number(totalPriceLYX.toFixed(2)),
          GBP: Number((totalPriceLYX * currencyData.GBP).toFixed(2)),
          EUR: Number((totalPriceLYX * currencyData.EUR).toFixed(2)),
        });

        setConvertedLYXPrice({
          USD: Number(lyxPrice.toFixed(2)),
          GBP: Number((lyxPrice * currencyData.GBP).toFixed(2)),
          EUR: Number((lyxPrice * currencyData.EUR).toFixed(2)),
        });
        
        const erc725js = new ERC725(lsp3ProfileSchema as ERC725JSONSchema[], address, 'https://rpc.testnet.lukso.gateway.fm',
          {
            ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
          },
        );

        const receivedAssetsDataKey = await erc725js.fetchData('LSP5ReceivedAssets[]');

        if (Array.isArray(receivedAssetsDataKey.value)) {

          const contractAddress = receivedAssetsDataKey.value
          console.log("contractAddress", contractAddress);

          // Assuming receivedAssetsDataKey.value is an array of contract addresses
          const contractAddresses = receivedAssetsDataKey.value;

          const lsp7Holdings = [];

          for (const contractAddress of contractAddresses) {
            const myerc725 = new ERC725(LSP4Schema as ERC725JSONSchema[], contractAddress, "https://rpc.testnet.lukso.gateway.fm/", {
              ipfsGateway: "https://api.universalprofile.cloud/ipfs"
            });

            const web3 = new Web3("https://rpc.testnet.lukso.network");
            const lsp7Contract = new web3.eth.Contract(
              LSP7DigitalAsset.abi as any,
              contractAddress
            );

            // Fetching balance for the given user address (replace with actual user address)
            // @ts-ignore
            const balance = await lsp7Contract.methods.balanceOf(address).call();

            // Fetching token name and symbol
            const digitalAssetMetadataSymbol = await myerc725.fetchData('LSP4TokenSymbol');
            const digitalAssetMetadataName = await myerc725.fetchData('LSP4TokenName');

            // Storing the fetched data in an object and adding it to the lsp7Holdings array
            lsp7Holdings.push({
              contractAddress: contractAddress,
              name: digitalAssetMetadataName.value,
              symbol: digitalAssetMetadataSymbol.value,
              balance: balance
            });
          }

          const modifiedTokenBalances = [
            // First, add the lyxToken object
            {
              Address: '0x',
              Name: 'Lukso',
              Symbol: 'LYX',
              Price: lyxPrice.toString(),
              Change24: "15",
              TokenAmount: balanceValue.toString(),
              TokenValue: totalPriceLYX.toString()
            },
            // Then, spread the results of the map over lsp7Holdings
            ...lsp7Holdings.map(token => {
              let tokenAmount = '0';
              if (token.balance) {
                tokenAmount = ethers.utils.formatEther(token.balance.toString());
              }
            
              return {
                Address: token.contractAddress,
                Name: typeof token.name === 'string' ? token.name : 'Unknown Token Name',
                Symbol: typeof token.symbol === 'string' ? token.symbol : 'Unknown Symbol',
                Price: '', // Leave empty for now
                Change24: '',
                TokenAmount: tokenAmount,
                TokenValue: '' // Leave empty for now
              };
            })
          ];
          
          setTokenBalances(modifiedTokenBalances);
          setIsLoading(false)
        }
          
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    if (isConnected) {
      loadData();
    }
  }, [data, address, currencyData, isConnected])

  return (
    <AssetsContext.Provider value={{ convertedBalances, convertedLYXPrice, tokenBalances, isLoading }}>
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = () => useContext(AssetsContext);