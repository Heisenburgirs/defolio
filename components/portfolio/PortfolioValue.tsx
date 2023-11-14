import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import hide from '@/public/icons/hide.svg';
import show from '@/public/icons/show.svg';

const currencySymbols: { [key: string]: string } = {
  USD: '$', // United States Dollar
  EUR: '€', // Euro
  GBP: '£', // British Pound
};

const PortfolioValue: React.FC<PortfolioValueProps> = ({ balance, currencySymbol, balanceVisible, setBalanceVisible }) => {
  const symbol = currencySymbols[currencySymbol] || '';

  return (
    <div className="flex flex-col gap-2">
      <h1 className="opacity-75 text-small">Portfolio Value</h1>
      <div className="flex gap-6 items-center">
        <h2 className="text-large font-bold text-purple">
          {
            balanceVisible ?
            `${symbol}${balance === 0 ? '0.00' : balance.toFixed(2)}` :
            "******"
          }
        </h2>
        <Image
          onClick={() => setBalanceVisible(!balanceVisible)}
          src={balanceVisible ? hide : show}
          width={24}
          height={24}
          alt="Hide Balance"
          className="hover:cursor-pointer"
        />
      </div>
    </div>
  );
};

export default PortfolioValue;