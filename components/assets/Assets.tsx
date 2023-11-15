import '../../app/globals.css'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import copy from '@/public/icons/copy.svg';
import externalLink from '@/public/icons/externalLink.svg';
import CurrencyDropdown, { currencyOptions } from '../currency/CurrencyDropdown';
import PortfolioValue from '../portfolio/PortfolioValue';
import SearchBar from '../searchbar/SearchBar';
import { LSPFactory } from '@lukso/lsp-factory.js';
import { ethers } from 'ethers';
import { useAccount, usePublicClient } from 'wagmi';
import LSP7Mintable from "@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json";
import { copyToClipboard } from '@/app/utils/useCopyToCliptboard';
import { NotificationType, notify } from '../toast/Toast';
import { useAssets } from '@/GlobalContext/AssetsContext.tsx/AssetsContext';

const Assets = () => {
  const { address, isConnected } = useAccount()

  // LYX balance, LYX price, Portfolio Value
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const {convertedBalances, convertedLYXPrice, tokenBalances, isLoading} = useAssets();

  const [noTokenBalance, setNoTokenBalance] = useState<boolean>(false)
  const [isDropdownVisible, setIsDropdownVisible] = useState<number | null>(null);

  const currencySymbols: { [key: string]: string } = {
    USD: '$', // United States Dollar
    EUR: '€', // Euro
    GBP: '£', // British Pound
  };

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(currencyOptions[0]);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = tokenBalances.filter(token => 
    token.Name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.Symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleDropdownClick = (index: number) => {
    if (index === isDropdownVisible) {
        setIsDropdownVisible(null); // Close if the same index is clicked
    } else {
        setIsDropdownVisible(index); // Open if a different index is clicked
    }
  };
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && isDropdownVisible !== null) {
            setIsDropdownVisible(null);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownVisible]);

  return (
    <>
      <div className="flex sm:flex-col md:flex-row w-full justify-between md:items-center sm:gap-4 md:gap-0">
        <PortfolioValue
          balance={convertedBalances[selectedCurrency.symbol as keyof typeof convertedBalances]}
          currencySymbol={selectedCurrency.symbol}
          balanceVisible={balanceVisible}
          setBalanceVisible={setBalanceVisible}
        />

        <div className="flex sm:flex-col base:flex-row sm:items-left md:items-center base:justify-between md:justify-none gap-4" >
          <SearchBar placeholder="Search for a token..." onSearch={value => setSearchQuery(value)}  />
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
            <div className="grid sm:grid-cols-4 lg:grid-cols-12">
              <div className="sm:col-span-2 base:col-span-1 lg:col-span-4 text-purple font-normal opacity-75 flex">
                Token
              </div>
              <div className="sm:hidden base:justify-end md:justify-center lg:justify-start base:flex sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75">
                Price
              </div>
              <div className="base:justify-end lg:justify-start sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75 flex">
                Balance
              </div>
              <div className="sm:col-span-1 lg:col-span-1"></div>
            </div>
          </div>

          {!isConnected ? (
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
              filteredTokens.map((token, index) => (
                <div key={index} className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12 py-2">
                  <div className="grid sm:grid-cols-4 lg:grid-cols-12 items-center">
                    <div className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-4 text-purple font-normal opacity-75">
                      <div className="flex flex-col">
                        <div className="text-small font-bold">{token.Name}</div>
                        <div className="text-xsmall opacity-75">{token.Symbol}</div>
                      </div>
                    </div>
                    <div className="base:justify-end md:justify-center lg:justify-start sm:hidden base:flex sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75 flex">
                      <div className="font-bold">
                        {token.Price && isValidCurrencyKey(selectedCurrency.symbol) 
                          ? currencySymbols[selectedCurrency.symbol]+convertedLYXPrice[selectedCurrency.symbol]
                          : "..."
                        }
                      </div>
                    </div>
                    <div className="flex flex-col base:items-end lg:items-start sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75">
                      <div className="font-bold">{balanceVisible ? (parseFloat(token.TokenAmount) % 1 === 0 ? parseInt(token.TokenAmount, 10) : parseFloat(token.TokenAmount).toFixed(2)) : "***"}</div>
                      <div className="text-xsmall opacity-75">
                        {balanceVisible ? token.TokenValue ? "("+currencySymbols[selectedCurrency.symbol]+Number(token.TokenValue).toFixed(2)+")" : "("+currencySymbols[selectedCurrency.symbol]+"0.00)" : "***"}
                      </div>
                    </div>
                    <div onClick={() => handleDropdownClick(index)} className="relative flex flex-col gap-2 sm:col-span-1 lg:col-span-1 pr-2 w-full items-end justify-end hover:cursor-pointer">
                      <div className="w-[3px] h-[3px] rounded-[99px] bg-lightPurple bg-opacity-75"></div>
                      <div className="w-[3px] h-[3px] rounded-[99px] bg-lightPurple bg-opacity-75"></div>
                      <div className="w-[3px] h-[3px] rounded-[99px] bg-lightPurple bg-opacity-75"></div>
                      {index === isDropdownVisible && <div ref={dropdownRef} className={`absolute top-0 w-[220px] flex flex-col gap-4 py-4 z-50 justify-center items-center bg-white shadow rounded-10 py-2 px-4 border border-lightPurple border-opacity-25 mr-[-10px] mt-[35px]  ${isDropdownVisible === index ? 'animate-popup-in' : 'animate-popup-out'}`}
                        style={{ animationFillMode: 'forwards' }}
                      >
                        <div className="flex gap-4 justify-center items-center">
                          <Image src={copy} width={18} height={18} alt="Copy Token Address" className="ml-[-20px]" />
                          <button onClick={() => {copyToClipboard(token.Address), handleDropdownClick(index); notify("Address Copied", NotificationType.Success)}} className="text-xsmall text-lightPurple">Copy token address</button>
                        </div>
                        <div className="flex gap-4 justify-center items-center">
                          <Image src={externalLink} width={18} height={18} alt="Copy Token Address" />
                          <a href={`https://explorer.execution.testnet.lukso.network/tx/${token.Address}`} target="_blank" onClick={() => {handleDropdownClick(index)}} className="text-xsmall text-lightPurple">View on block explorer</a>
                        </div>
                      </div>
                      }
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