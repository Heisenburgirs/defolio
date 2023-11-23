"use client"

import { useState } from 'react';
import { useDraggableScroll } from '../utils/useDraggableScroll';
import '../globals.css';

// Navbar
import Navbar from '@/components/navbar/Navbar';

// Assets
import Assets from '@/components/assets/Assets'

// Keymanager
import Keymanager from '@/components/keymanager/Keymanager'

// Send
import Transfer from '@/components/transfer/Transfer';

// Notification
import Notifications from '@/components/notifications/Notifications';
import Vault from '@/components/vault/Vault';

// Navbar Menu
const menuItems = ["Assets", "Key Manager", "Vault", "Guardians", "Inheritance", "Carbon", "Send", "Notifications"];

export default function Portfolio() {

  // Custom hook for overflow scroll
  const { ref: ulRef, scrollToElement } = useDraggableScroll();
  const [selectedMenuItem, setSelectedMenuItem] = useState("Assets");

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
        {
          selectedMenuItem == "Assets" &&
          <Assets />
        }
        {
          selectedMenuItem == "Key Manager" && 
          <Keymanager />
        }
        {
          selectedMenuItem == "Send" && 
          <Transfer />
        }
        {
          selectedMenuItem == "Notifications" && 
          <Notifications />
        }
        {
          selectedMenuItem == "Vault" &&
          <Vault />
        }
      </section>
    </main>
  )
}