"use client"

import { useEffect, useRef, useState } from 'react';
import { useDraggableScroll } from '../utils/useDraggableScroll';
import '../globals.css';

// Balance
import Image from 'next/image';
import hide from '@/public/icons/hide.svg';
import show from '@/public/icons/show.svg';

// Currency
import USD from '@/public/currency/USD.svg';
import EUR from '@/public/currency/EUR.svg';
import GBP from '@/public/currency/GBP.svg';
import downArrow from '@/public/icons/down-arrow.png';

// Search
import search from '@/public/icons/search.png';

// Dashboard Menu
const MenuItem = ({ itemName, selectedMenuItem, menuSelection } : {itemName: string, selectedMenuItem: string, menuSelection: (itemName: string) => void}) => {
  const isSelected = selectedMenuItem === itemName;
  const baseClasses = "min-w-[150px] lg:text-left rounded-15 flex sm:items-center sm:justify-center lg:items-left lg:justify-start lg sm:py-2 lg:py-4 px-6 cursor-pointer transition";
  const textClass = isSelected ? "text-white" : "text-purple hover:text-white";
  const bgClass = isSelected ? "bg-purple" : "hover:bg-lightPurple";
  
  return (
    <li
      data-name={itemName}
      onClick={() => menuSelection(itemName)}
      className={`${baseClasses} ${textClass} ${bgClass}`}
    >
      {itemName}
    </li>
  );
};

// Currency Dropdown
const currencyOptions = [
  { symbol: 'USD', name: 'US Dollar', image: USD },
  { symbol: 'EUR', name: 'Euro', image: EUR },
  { symbol: 'GBP', name: 'British Pound', image: GBP },
];

export default function Portfolio() {
  // Custom hook for overflow scroll
  const { ref: ulRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd, onWheel, scrollToElement } = useDraggableScroll();
  const [selectedMenuItem, setSelectedMenuItem] = useState("Assets");
  
  // Currency Dropdown
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (isDropDownOpen) {
      // Start the closing animation
      setDropdownVisible(false);
      // Wait for the animation to complete before hiding the dropdown
      setTimeout(() => setIsDropDownOpen(false), 200); // matches the animation duration
    } else {
      setIsDropDownOpen(true);
      // Immediately make the dropdown visible for the opening animation
      setDropdownVisible(true); 
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (ref.current && !ref.current.contains(target) && isDropDownOpen) {
        // This will start the closing animation
        toggleDropdown();
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropDownOpen]);
  
  // Balance
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);

  // Dashboard Menu
  const menuItems = ["Assets", "Key Manager", "Guardians", "Session Keys", "Inheritance", "Carbon", "Send & Receive", "Bridge"];

  // Select dashboard menu items
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
        <ul 
          ref={ulRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onWheel={onWheel} className="flex w-full overflow-x-auto lg:h-full flex-row lg:flex-col gap-6 text-xsmall sm:py-4 lg:py-0">
          {menuItems.map((item) => (
            <MenuItem
              key={item}
              itemName={item}
              selectedMenuItem={selectedMenuItem}
              menuSelection={menuSelection}
            />
          ))}  
        </ul>
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

          <div className="flex sm:flex-col base:flex-row sm:items-left md:items-center gap-4" >
            <div className="relative">
              <input type="text" placeholder="Search for a token..." className="focus:outline-purple text-xsmall py-2.5 base:pl-10 sm:px-8 base:px-4 md:px-10 bg-background border border-lightPurple border-opacity-75 rounded-15" />
              <Image src={search} width={16} height={16} alt="Search" className="absolute left-0 ml-4 top-1/2 transform -translate-y-1/2" /> 
            </div>
            <div ref={ref} className="sm:w-[125px] relative">
              <div
                className={`flex items-center justify-between cursor-pointer border border-purple border-opacity-75 rounded-15 p-2 gap-2 bg-lightBlack transition ${isDropDownOpen ? "bg-lightPurple bg-opacity-20" : "hover:bg-lightPurple hover:bg-opacity-20"}`}
                onClick={toggleDropdown}
              >
                <Image src={selectedCurrency.image} width={24} height={24} alt={selectedCurrency.name} />
                <span className="ml-2">{selectedCurrency.symbol}</span>
                <Image src={downArrow} width={12} height={12} alt="Down Arrow" className="ml-2" />
              </div>

              {isDropDownOpen && (
                <div
                  className={`flex flex-col gap-2 bg-white absolute left-0 right-0 sm:ml-[0px] base:ml-[-130px] mt-2 border w-[250px] py-6 px-4 border-purple border-opacity-75 rounded-15 z-10 ${dropdownVisible ? 'animate-popup-in' : 'animate-popup-out'}`}
                  style={{ animationFillMode: 'forwards' }}
                  onAnimationEnd={() => {
                    if (!dropdownVisible) {
                      setIsDropDownOpen(false);
                    }
                  }}
                >
                  <div className="opacity-75 text-xsmall pl-4 pb-4">Popular Currencies</div>
                  {currencyOptions.map((currency, index) => (
                    <div key={index} className="flex items-center gap-4 rounded-15 transition cursor-pointer hover:bg-lightPurple hover:bg-opacity-20 py-2 px-4" onClick={() => {
                      setSelectedCurrency(currency);
                      setIsDropDownOpen(false);
                    }}>
                        <Image src={currency.image} width={32} height={32} alt={currency.name} />
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{currency.symbol}</span>
                          <div>{currency.name}</div>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex h-full bg-white rounded-15 shadow px-6 py-8">
          test
        </div>
      </section>
    </main>
  )
}
