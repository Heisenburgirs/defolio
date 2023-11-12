import '../../app/globals.css'
import React, { useState, useEffect } from 'react';
import CurrencyDropdown, { currencyOptions } from '../currency/CurrencyDropdown';
import PortfolioValue from '../portfolio/PortfolioValue';
import SearchBar from '../searchbar/SearchBar';
import { LSPFactory } from '@lukso/lsp-factory.js';
import { ethers } from 'ethers';
import { useAccount, useBalance, usePublicClient } from 'wagmi';
import { useCurrencyData } from '../context/CurrencyContext';
import LSP7Mintable from "@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json";
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json' assert { type: 'json' };
import LSP4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import Web3 from 'web3';

const Assets = () => {

  // LYX balance, LYX price, Portfolio Value
  const { address, isConnected, isDisconnected } = useAccount()
  const { data, isError } = useBalance({
    address: address,
  })
  const { currencyData, error, loading } = useCurrencyData();

  const [noTokenBalance, setNoTokenBalance] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true);

  const [convertedBalances, setConvertedBalances] = useState<{ USD: number; GBP: number; EUR: number }>({
    USD: 0,
    GBP: 0,
    EUR: 0,
  });

  const [convertedLYXPrice, setConvertedLYXPrice] = useState<{ USD: number; GBP: number; EUR: number }>({
    USD: 0,
    GBP: 0,
    EUR: 0,
  })

  const currencySymbols: { [key: string]: string } = {
    USD: '$', // United States Dollar
    EUR: '€', // Euro
    GBP: '£', // British Pound
  };

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(currencyOptions[0]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
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
          setIsLoading(false);
          console.log(modifiedTokenBalances)
        }
          
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    if (isConnected) {
      loadData();
    }
  }, [data, address, currencyData, isConnected])

  // LSP7 Token Balances
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>([])
  
  // Currency Dropdown
  const handleCurrencySelect = (currency: CurrencyOption) => {
    setSelectedCurrency(currency);
  };

  /* FUNCTIONS LSP7 */

  const publicClient = usePublicClient()
  const provider = async () => {
    console.log(publicClient)
    console.log("address, address", address)

    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();
    const lspFactory = new LSPFactory(provider, {
      chainId: 4201,
    });

    const myContracts = await lspFactory.LSP7DigitalAsset.deploy({
      isNFT: false,
      controllerAddress: await signer.getAddress() || "",
      name: 'MYTOKEN',
      symbol: 'DEMO',
    });

    console.log(myContracts)
  }

  const mint = async () => {
    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();
    const contract = "0xF76698c633534B6108F447540e3b2b2A480be164";

    const myContract = new ethers.Contract(contract, LSP7Mintable.abi, signer);

    const tx = await myContract.mint(address, "100000000000000000000", false, '0x');

    console.log("result", tx)
  }

  const isValidCurrencyKey = (key: string): key is keyof typeof convertedLYXPrice => {
    return key in convertedLYXPrice;
  }

  return (
    <>
      <div className="flex sm:flex-col md:flex-row w-full justify-between md:items-center sm:gap-4 md:gap-0">
        <PortfolioValue
          balance={convertedBalances[selectedCurrency.symbol as keyof typeof convertedBalances]}
          currencySymbol={selectedCurrency.symbol}
        />

        <div className="flex sm:flex-col base:flex-row sm:items-left md:items-center base:justify-between md:justify-none gap-4" >
          <SearchBar placeholder="Search for a token..." />
          <CurrencyDropdown
            selectedCurrency={selectedCurrency}
            onSelect={handleCurrencySelect}
          />
        </div>
      </div>
      <div className="flex h-full bg-white rounded-15 shadow px-6 py-8">
        {/*<div onClick={provider}>tets</div>
        <div onClick={mint}>Mint</div>*/}

        <div className="flex flex-col w-full gap-2">
          <div className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12">
            <div className="grid sm:grid-cols-3 lg:grid-cols-12">
              <div className="sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal opacity-75 flex">
                Token
              </div>
              <div className="sm:hidden base:flex sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75">
                Price
              </div>
              <div className="sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75 flex">
                Balance
              </div>
            </div>
          </div>

          {noTokenBalance ? (
            <div className="flex items-center justify-center py-8 text-lightPurple text-small">No assets</div>
          )
          :
          (
            isLoading ? (
              <div className="loading opacity-75 w-full flex justify-center items-center p-16">
                <span className="loading__dot"></span>
                <span className="loading__dot"></span>
                <span className="loading__dot"></span>
              </div>
            )
            :
            (
              isConnected &&
              tokenBalances.map((token, index) => (
                <div key={index} className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12 py-2">
                  <div className="grid sm:grid-cols-3 lg:grid-cols-12 items-center">
                    <div className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal opacity-75">
                      <div className="flex flex-col">
                        <div className="text-small font-bold">{token.Name}</div>
                        <div className="text-xsmall opacity-75">{token.Symbol}</div>
                      </div>
                    </div>
                    <div className="sm:hidden base:block sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75 flex">
                      <div className="font-bold">
                        {token.Price && isValidCurrencyKey(selectedCurrency.symbol) 
                          ? currencySymbols[selectedCurrency.symbol]+convertedLYXPrice[selectedCurrency.symbol]
                          : "..."
                        }
                      </div>
                    </div>
                    <div className="flex flex-col sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75">
                      <div className="font-bold">{Number(token.TokenAmount).toFixed(0)}</div>
                      <div className="text-xsmall opacity-75">{token.TokenValue ? "("+currencySymbols[selectedCurrency.symbol]+Number(token.TokenValue).toFixed(2)+")" : "("+currencySymbols[selectedCurrency.symbol]+"0.00)"}</div>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Assets