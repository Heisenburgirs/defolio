"use client"

import React from 'react';
import { usePathname } from "next/navigation";
import Link from 'next/link';

function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="flex justify-between items-center sm:px-4 sm:py-6 md:px-8 md:py-8 lg:px-8 lg:py-2 bg-white shadow-sm">
      <div className="w-full flex justify-between text-purple">
        <div className="grid sm:grid-cols-1  base:grid-cols-2 md:grid-cols-4 sm:py-6 gap-8 text-center w-full justify-between text-purple opacity-75 hover:opacity-100 hover:cursor-pointer transition">
          <div>Copyright@</div>
          <div>About Us</div>
          <div>Terms and Servies</div>
          <div>Privacy Policy</div>
        </div>
      </div>
    </div>
  );
}

export default Footer;