"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
function Header () {
  const pathname = usePathname();
  const isHome = pathname === "/";

  /*useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace 'your-api-endpoint' with your actual API endpoint
        const response = await fetch("https://v6.exchangerate-api.com/v6/5ccbecbd4fc65fb7e62aa13c/pair/USD/GBP");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result)
        setData(result);
      } catch (err) {
        //@ts-ignore
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);*/

  const { address } = useAccount()
  const { data, isError, isLoading } = useBalance({
    address: address,
  })

  useEffect(() => {
    console.log("address", address)
    console.log("data", data)
  }, [address]);

  return (
    <div className="flex justify-between items-center sm:px-4 sm:py-6 md:px-8 md:py-4 bg-white shadow">
      <div className="w-full flex justify-between items-center text-purple">
        <Link href="/" className="text-xl font-bold text-purple">DeFolio</Link>
        <div className="text-purple">
          {isHome ?
          (
            <a href="https://github.com/Heisenburgirs?tab=repositories" target="_blank" className="sm:text-xxsmall base:text-small">/* Made by Heisen 🍔 */</a>
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