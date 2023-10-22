"use client"

import React from 'react';
import { usePathname } from "next/navigation";
import Link from 'next/link';

function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPortfolio = pathname === "/portfolio";
  const isPortal = pathname === "/portal";

  return (
    <div className="flex justify-between items-center py-4 px-6 border-b border-white">
      <Link href="/" className="text-xl font-bold text-white">DeFolio</Link>
      <div className="text-white">
        {isHome ?
        (
          <div>/* Made by Heisen🍔 */</div>
        )
        :
        (
          isPortfolio ?
          (
            <div>IsPortfolio</div>
          )
          :
          (
            <div>isPortal</div>
          )
        )}
      </div>
    </div>
  );
}

export default Header;