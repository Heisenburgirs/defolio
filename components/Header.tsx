"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { createEIP1193Provider } from "@web3-onboard/common";
import Web3 from 'web3';
import LSP3 from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Toast
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

enum NotificationType {
  Success,
  Error,
  Warning,
  Info,
  Default
}

export const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Notify function that takes a message and a notification type
  const notify = (message: string, type: NotificationType = NotificationType.Default) => {
    const options = {
      position: toast.POSITION.BOTTOM_RIGHT, // default position
    };

    switch (type) {
      case NotificationType.Success:
        toast.success(
          message,
          { ...options,
          position: toast.POSITION.BOTTOM_RIGHT,
          transition: Slide,
          hideProgressBar: true,
          autoClose: 1500,
          style: {
          backgroundColor: 'white', // success green, for example
          color: '#8993d1',
          fontWeight: 'bold',
          fontSize: '16px',
          borderRadius: '15px',
          padding: '16px',
        } });
        break;
      case NotificationType.Error:
        toast.error(message, { ...options, position: toast.POSITION.TOP_LEFT });
        break;
      case NotificationType.Warning:
        toast.warn(message, { ...options, position: toast.POSITION.BOTTOM_LEFT });
        break;
      case NotificationType.Info:
        toast.info(message, { ...options, position: toast.POSITION.BOTTOM_CENTER });
        break;
      default:
        toast(message, options);
    }
  };
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="flex justify-between items-center sm:px-4 sm:py-6 md:px-8 md:py-4 bg-white shadow">
      <div className="w-full flex justify-between text-purple">
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