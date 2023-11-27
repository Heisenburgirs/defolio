"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Header () {
  const pathname = usePathname();
  const isHome = pathname === "/";


  return (
    <div className="flex justify-between items-center sm:px-4 sm:py-6 md:px-8 md:py-4 bg-white shadow">
      <div className="w-full flex justify-between items-center text-purple">
        <Link href="/" className="text-xl font-bold text-purple">DeFolio</Link>
        <div className="text-purple">
          {isHome ?
          (
            <a href="https://github.com/Heisenburgirs?tab=repositories" target="_blank" className="sm:text-xxsmall base:text-small">Made by Heisen 🍔</a>
          )
          :
          (
            <ConnectButton />
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;