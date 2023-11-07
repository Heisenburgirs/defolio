"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { createEIP1193Provider } from "@web3-onboard/common";
import Web3 from 'web3';
import { SiweMessage } from 'siwe';
import UniversalProfileContract from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json' assert { type: 'json' };
import { formatAddress } from '@/app/utils/useDraggableScroll';

function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // UP Wallet Connection
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [userAddress, setUserAddress] = useState<string>("");

  // SIWE Login with UP Extension
  const connectUP = async () => {

    // Check if UP is installed
    if ("lukso" in window) {
      // Setup provider
      setIsConnecting(true);

      const anyWindow = window;
      const luksoProvider = createEIP1193Provider(anyWindow.lukso)
      const web3 = new Web3(luksoProvider);

      try {
        // Connect UP
        await web3.eth.requestAccounts();
      
        const accounts = await web3.eth.getAccounts();

        try {
          // Request signature

          // To enable the Sign-In With Ethereum (SIWE) screen, you need to prepare a message with a specific format
          const hashedMessage =  web3.eth.accounts.hashMessage(
            new SiweMessage({
              domain: window.location.host, // Domain requesting the signing
              address: accounts[0],           // Address performing the signing
              statement: 'By logging in you agree to the terms and conditions.', // a human-readable assertion user signs
              uri: window.location.origin,  // URI from the resource that is the subject of the signing
              version: '1',                 // Current version of the SIWE Message
              chainId: 4201,              // Chain ID to which the session is bound, 4201 is LUKSO Testnet
              resources: ['https://defolio.com'], // Information the user wishes to have resolved as part of authentication by the relying party
          }).prepareMessage());

          // Request the user to sign the login message with his Universal Profile
          // The UP Browser Extension will sign the message with the controller key used by the extension (a smart contract can't sign)
          const signature = await web3.eth.sign(hashedMessage, accounts[0]);

          try {
            // Verify Signature
            const myUniversalProfileContract = new web3.eth.Contract(
              UniversalProfileContract.abi,
              accounts[0],
            );
            
            const isValid = await myUniversalProfileContract.methods
            //@ts-ignore
            .isValidSignature(hashedMessage, signature)
            .call() as string;
            
            if (isValid == '0xffffffff') {
              // Login successful
              setUserAddress(accounts[0])
              setIsConnecting(false);
              setIsConnected(true);
            } else {
              // The EOA which signed the message has no SIGN permission over this UP.
              console.log('Log In failed');
            }

            /*const erc725js = new ERC725(lsp3ProfileSchema as ERC725JSONSchema[], accounts[0], 'https://rpc.testnet.lukso.gateway.fm',
              {
                ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
              },
            );

            // Get all profile data keys of the smart contract
            const profileMetaData = await erc725js.fetchData('LSP3Profile');
            console.log("profileMetaData", profileMetaData);*/

          } catch (err) {
            console.log("ERROR VERIFYING SIGNATURE: ", err)
            setIsConnecting(false);
          }
        } catch (err) {
          console.log("ERROR GETTING SIGNATURE", err)
          setIsConnecting(false);
        }

      } catch (err) {
        console.log("ERROR CONNECTING TO UP WALLET", err)
        setIsConnecting(false);
      }
      

    } else {
      window.open("https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en", "_blank");
      throw new Error("Please install LUKSO Universal Profile extension before proceeding");
    }
  }

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
            <>
              <button 
                onClick={connectUP}
                className={`text-white bg-lightPurple bg-opacity-75 rounded-15 hover:cursor-pointer hover:bg-opacity-100 transition py-2 px-4 font-bold ${isConnected && "bg-opacity-100"}`}>
                {isConnected ? formatAddress(userAddress) : isConnecting ? "CONNECTING" : "CONNECT"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;