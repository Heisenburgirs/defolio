import React, { useState, useEffect } from 'react';
import CurrencyDropdown, { currencyOptions } from '../currency/CurrencyDropdown';
import PortfolioValue from '../portfolio/PortfolioValue';
import SearchBar from '../searchbar/SearchBar';
//import { LSPFactory } from '@lukso/lsp-factory.js';
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
  const { data, isError, isLoading } = useBalance({
    address: address,
  })
  const { currencyData, error, loading } = useCurrencyData();

  const [convertedBalances, setConvertedBalances] = useState<{ USD: number; GBP: number; EUR: number }>({
    USD: 0,
    GBP: 0,
    EUR: 0,
  });

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(currencyOptions[0]);

  useEffect(() => {
    async function loadData() {
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
        
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
  
    loadData();
  }, [data, address, currencyData, isConnected])

  // Table
  const [tableRow, setTableRow] = useState<TableRow>({
    Name: [''],
    Symbol: [''],
    Price: [''],
    Change24: [''],
    TokenAmount: [''],
    TokenValue: ['']
  })
  
  // Currency Dropdown
  const handleCurrencySelect = (currency: CurrencyOption) => {
    setSelectedCurrency(currency);
  };

  /* FUNCTIONS LSP7 */

  const publicClient = usePublicClient()
  {/*const provider = async () => {
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
  }*/}

  const mint = async () => {
    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();
    const contract = "0xf9056FF9ad48cC5A7F5FFf29db0Ec4eC31dbDB67";

    const myContract = new ethers.Contract(contract, LSP7Mintable.abi, signer);

    const tx = await myContract.mint(address, "10000000000000000", false, '0x');

    console.log("result", tx)
  }

  const assets = async () => {
    const erc725js = new ERC725(lsp3ProfileSchema as ERC725JSONSchema[], address, 'https://rpc.testnet.lukso.gateway.fm',
      {
        ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
      },
    );

    const profileData = await erc725js.getData();
    console.log("profileData", profileData);

    const receivedAssetsDataKey = await erc725js.fetchData('LSP5ReceivedAssets[]');
    if (Array.isArray(receivedAssetsDataKey.value)) {

      const contractAddress = receivedAssetsDataKey.value[0]
      console.log("contractAddress", contractAddress);

      const myerc725 = new ERC725(LSP4Schema as ERC725JSONSchema[], contractAddress, "https://rpc.testnet.lukso.gateway.fm/",{
        ipfsGateway: "https://api.universalprofile.cloud/ipfs"
      });

      const web3 = new Web3("https://rpc.testnet.lukso.network");
      const lsp7Contract = new web3.eth.Contract (
        LSP7DigitalAsset.abi as any,
        contractAddress
      )

      // @ts-ignore
      const balance = await lsp7Contract.methods.balanceOf("0x1a62AcD2277d5FaC5266F71f2B968fB55d83BC72").call()
      console.log(address)
      console.log(balance)

      const digitalAssetMetadata1 = await myerc725.fetchData('LSP4Metadata');
      const digitalAssetMetadata2 = await myerc725.fetchData('LSP4TokenSymbol');
      const digitalAssetMetadata3 = await myerc725.fetchData('LSP4TokenName');
      const digitalAssetMetadata4 = await myerc725.fetchData('LSP4Creators[]');
      console.log(digitalAssetMetadata1);
      console.log(digitalAssetMetadata2);
      console.log(digitalAssetMetadata3);
      console.log(digitalAssetMetadata4);
    }
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
        <div onClick={assets}>Assets</div>

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

          <div className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12 py-2">
            <div  className="grid sm:grid-cols-3 lg:grid-cols-12 items-center">
              <div className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal opacity-75">
                {/*<div>🍌</div>*/}
                <div className="flex flex-col">
                  <div className="text-small font-bold">ETH</div>
                  <div className="text-xsmall opacity-75">Ethereum</div>
                </div>
              </div>
              <div className="sm:hidden base:block sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75 flex">
                <div className="font-bold">$1960.15</div>
                <div className="text-xsmall opacity-75">(-%15.50)</div>
              </div>
              <div className="flex flex-col sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75">
                <div className="font-bold">1.5 ETH</div>
                <div className="text-xsmall opacity-75">($2607.15)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assets