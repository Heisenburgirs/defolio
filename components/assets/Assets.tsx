import React, { useState, useEffect } from 'react';
import CurrencyDropdown, { currencyOptions } from '../currency/CurrencyDropdown';
import PortfolioValue from '../portfolio/PortfolioValue';
import SearchBar from '../searchbar/SearchBar';
import { LSPFactory } from '@lukso/lsp-factory.js';
import { ethers } from 'ethers';
import { useAccount, useBalance, usePublicClient } from 'wagmi';
import { useCurrencyData } from '../context/CurrencyContext';
import LSP7Mintable from "@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json";

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
        const totalPriceLYX = Number(data?.formatted) * lyxPrice;

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
    Image: [''],
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
    const contract = "0xf9056FF9ad48cC5A7F5FFf29db0Ec4eC31dbDB67";

    const myContract = new ethers.Contract(contract, LSP7Mintable.abi, signer);

    const tx = await myContract.mint(address, "10000000000000000", false, '0x');

    console.log("result", tx)
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
          <thead className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12">
            <tr className="grid sm:grid-cols-3 lg:grid-cols-12">
              <th className="sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal opacity-75 flex">
                Token
              </th>
              <th className="sm:hidden base:flex sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75">
                Price
              </th>
              <th className="sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75 flex">
                Balance
              </th>
            </tr>
          </thead>

          <tbody className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12 py-2">
            <tr  className="grid sm:grid-cols-3 lg:grid-cols-12 items-center">
              <td className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal opacity-75">
                <div>🍌</div>
                <div className="flex flex-col">
                  <div className="text-small font-bold">ETH</div>
                  <div className="text-xsmall opacity-75">Ethereum</div>
                </div>
              </td>
              <td className="sm:hidden base:block sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75 flex">
                <div className="font-bold">$1960.15</div>
                <div className="text-xsmall opacity-75">(-%15.50)</div>
              </td>
              <td className="flex flex-col sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75">
                <div className="font-bold">1.5 ETH</div>
                <div className="text-xsmall opacity-75">($2607.15)</div>
              </td>
            </tr>
          </tbody>
        </div>
      </div>
    </>
  );
};

export default Assets