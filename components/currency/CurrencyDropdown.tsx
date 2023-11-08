import React, { useState, useRef, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';

// Currency icons
import USD from '@/public/currency/USD.svg';
import EUR from '@/public/currency/EUR.svg';
import GBP from '@/public/currency/GBP.svg';
import downArrow from '@/public/icons/down-arrow.png';

// Currency options
export const currencyOptions: CurrencyOption[] = [
  { symbol: 'USD', name: 'US Dollar', image: USD },
  { symbol: 'EUR', name: 'Euro', image: EUR },
  { symbol: 'GBP', name: 'British Pound', image: GBP },
];

const CurrencyDropdown = ({ selectedCurrency, onSelect }: CurrencyDropdownProps) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setDropdownVisible(false);
    setTimeout(() => setIsDropDownOpen(false), 200);
  };

  const toggleDropdown = () => {
    if (isDropDownOpen) {
      setDropdownVisible(false);
      closeDropdown();
    } else {
      setIsDropDownOpen(true);
      setDropdownVisible(true);
    }
  };

  const handleCurrencySelection = (currency: CurrencyOption) => {
    onSelect(currency);
    closeDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && isDropDownOpen) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropDownOpen]);

  return (
    <div ref={ref} className="relative">
      <div
        className={`w-[120px] flex items-center justify-between cursor-pointer border border-purple border-opacity-75 rounded-15 p-2 gap-2 bg-lightBlack transition ${isDropDownOpen ? "bg-lightPurple bg-opacity-20" : "hover:bg-lightPurple hover:bg-opacity-20"}`}
        onClick={toggleDropdown}
      >
        <Image src={selectedCurrency.image} width={24} height={24} alt={selectedCurrency.name} />
        <span className="ml-2">{selectedCurrency.symbol}</span>
        <Image src={downArrow} width={12} height={12} alt="Down Arrow" className="ml-2" />
      </div>

      {isDropDownOpen && (
        <div
          className={`flex flex-col gap-2 bg-white absolute left-0 right-0 mt-2 sm:ml-0 base:ml-[-130px] border w-[250px] py-6 px-4 border-purple border-opacity-75 rounded-15 z-10 ${dropdownVisible ? 'animate-popup-in' : 'animate-popup-out'}`}
          style={{ animationFillMode: 'forwards' }}
          onAnimationEnd={() => {
            if (!dropdownVisible) {
              setIsDropDownOpen(false);
            }
          }}
        >
          <div className="opacity-75 text-xsmall pl-4 pb-4">Popular Currencies</div>
          {currencyOptions.map((currency, index) => (
            <div key={index} className="flex items-center gap-4 rounded-15 transition cursor-pointer hover:bg-lightPurple hover:bg-opacity-20 py-2 px-4" onClick={() => handleCurrencySelection(currency)}>
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
  );
};

export default CurrencyDropdown;
