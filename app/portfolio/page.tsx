"use client"

import { useEffect, useRef, useState } from 'react';
import { useDraggableScroll } from '../utils/useDraggableScroll';
import '../globals.css';

// Navbar
import Navbar from '@/components/navbar/Navbar';

// Search
import SearchBar from '@/components/searchbar/SearchBar'

// Portfolio Value
import PortfolioValue from '@/components/portfolio/PortfolioValue';

// Currency dropdown
import CurrencyDropdown from '@/components/currency/CurrencyDropdown';
import { currencyOptions } from '@/components/currency/CurrencyDropdown';

// Wagmi test
import { SignMessage } from '../hooks/wagmi'

// Exchange rates
import { useCurrencyData } from '@/components/context/CurrencyContext';
import { LSPFactory } from '@lukso/lsp-factory.js';
import { usePublicClient } from 'wagmi';
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'
import LSP from "@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json";


// Navbar Menu
const menuItems = ["Assets", "Key Manager", "Guardians", "Session Keys", "Inheritance", "Carbon", "Send & Receive", "Bridge"];

export default function Portfolio() {
  const { address } = useAccount()
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

    const myContract = new ethers.Contract(contract, LSP.abi, signer);

    const tx = await myContract.mint(address, "10000000000000000", false, '0x');

    console.log("result", tx)
  }

  const { currencyData, error, loading } = useCurrencyData();
  const [balance, setBalance] = useState<number>(100); // Your initial USD balance
  const [convertedBalances, setConvertedBalances] = useState<{ USD: number; GBP: number; EUR: number }>({
    USD: balance,
    GBP: 0,
    EUR: 0,
  });

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(currencyOptions[0]);
  
  // Currency Dropdown
  const handleCurrencySelect = (currency: CurrencyOption) => {
    setSelectedCurrency(currency);
  };

  // Convert balance when rates or balance change
  useEffect(() => {
    if (currencyData) {
      setConvertedBalances({
        USD: balance,
        GBP: balance * currencyData.GBP,
        EUR: balance * currencyData.EUR,
      });
    }
  }, [balance, currencyData]);

  // Custom hook for overflow scroll
  const { ref: ulRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd, onWheel, scrollToElement } = useDraggableScroll();
  const [selectedMenuItem, setSelectedMenuItem] = useState("Assets");

  // Select navbar menu items
  const menuSelection = (itemName: string) => {
    setSelectedMenuItem(itemName);
    // Check that ulRef.current is not null before trying to access its properties
    if (ulRef.current) {
      // Cast the returned Element to an HTMLElement
      const menuItemElement = ulRef.current.querySelector(`li[data-name="${itemName}"]`) as HTMLElement;
      if (menuItemElement) {
        scrollToElement(menuItemElement);
      }
    }
  };

  return (
    <main className="flex flex-col lg:flex-row w-full h-full sm:px-4 sm:py-6 md:px-8 md:py-8 lg:px-8 lg:py-6 gap-8">
      <section className="flex flex-col gap-10 w-full lg:w-1/5 xl:w-1/6  bg-white rounded-15 shadow px-6 py-8">
        <h1 className="text-medium px-6 font-bold text-purple">Dashboard</h1>
        <Navbar
          selectedMenuItem={selectedMenuItem}
          menuSelection={menuSelection}
          menuItems={menuItems}
        />
        <div className="flex w-full items-center justify-center text-purple opacity-75 text-xxsmall">Dapp Version 1.0</div>
      </section>

      <section className="flex flex-col gap-6 w-full lg:w-4/5 xl:w-5/6 h-full">
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
          <div onClick={provider}>tets</div>
          <div onClick={mint}>Mint</div>
        </div>
      </section>
    </main>
  )
}