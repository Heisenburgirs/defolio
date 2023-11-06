"use client"

import React from 'react';
import { usePathname } from "next/navigation";
import Link from 'next/link';

function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="flex justify-between items-center sm:px-4 sm:py-6 md:px-8 md:py-6 bg-white shadow">
      <div className="w-full flex justify-between text-purple">
        <Link href="/" className="text-xl font-bold text-purple">DeFolio</Link>
        <div className="text-purple">
          {isHome ?
          (
            <a href="https://github.com/Heisenburgirs?tab=repositories" target="_blank" className="sm:text-xxsmall base:text-small">/* Made by Heisen 🍔 */</a>
          )
          :
          (
            <div>IsPortfolio</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;