"use client"

import { useEffect, useRef, useState } from 'react';
import { useDraggableScroll } from '../utils/useDraggableScroll';
import '../globals.css';

// Navbar
import Navbar from '@/components/navbar/Navbar';

// Currency dropdown
import CurrencyDropdown from '@/components/currency/CurrencyDropdown';
import { currencyOptions } from '@/components/currency/CurrencyDropdown';

// Balance Icons
import Image from 'next/image';
import hide from '@/public/icons/hide.svg';
import show from '@/public/icons/show.svg';


// Search
import search from '@/public/icons/search.png';

// Wagmi test
import { SignMessage } from '../hooks/wagmi'

export default function Portfolio() {
  // Custom hook for overflow scroll
  const { ref: ulRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd, onWheel, scrollToElement } = useDraggableScroll();
  const [selectedMenuItem, setSelectedMenuItem] = useState("Assets");
  
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);
  
  // Currency Dropdown
  const handleCurrencySelect = (currency: CurrencyOption) => {
    setSelectedCurrency(currency);
  };
  
  // Balance
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);

  // Navbar Menu
  const menuItems = ["Assets", "Key Manager", "Guardians", "Session Keys", "Inheritance", "Carbon", "Send & Receive", "Bridge"];

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
          <div className="flex flex-col gap-2">
            <h1 className="opacity-75 text-small">Portfolio Value</h1>
            <div className="flex gap-6 items-center">
              <h2 className="text-large font-bold text-purple">{balanceVisible ? "$0.00" : "******"}</h2>
              <Image onClick={() => {setBalanceVisible(!balanceVisible)}} src={balanceVisible ? hide : show} width={24} height={24} alt="Hide Balance" className="hover:cursor-pointer" />
            </div>
          </div>

          <div className="flex sm:flex-col base:flex-row sm:items-left md:items-center base:justify-between md:justify-none gap-4" >
            <div className="relative">
              <input type="text" placeholder="Search for a token..." className="focus:outline-purple text-xsmall py-2.5 base:pl-10 sm:px-12 base:px-4 md:px-10 bg-background border border-lightPurple border-opacity-75 rounded-15" />
              <Image src={search} width={16} height={16} alt="Search" className="absolute left-0 ml-4 top-1/2 transform -translate-y-1/2" /> 
            </div>
            <CurrencyDropdown
              selectedCurrency={selectedCurrency}
              onSelect={handleCurrencySelect}
            />
          </div>
        </div>
        <div className="flex h-full bg-white rounded-15 shadow px-6 py-8">
          {}
        </div>
      </section>
    </main>
  )
}