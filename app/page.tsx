"use client"

import Image from 'next/image'
import ethereum from '@/public/ethereum.png'
import Link from 'next/link'
import { signIn, signOut } from 'next-auth/react';
import { useSession } from "next-auth/react";

export default function Landing() {
  const { data: session } = useSession();

  if (session) {
    console.log(session.user?.name);
    console.log(session.user?.email);
  }

  return (
    <main className="flex flex-col w-full h-full sm:px-4 sm:py-4 md:px-16 md:py-16 lg:px-32 lg:py-24 gap-64 justify-between">
      <div className="flex w-full justify-between">
        <div className="flex flex-col gap-32">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <div className="text-white text-xlarge font-bold">Leading Portfolio Tracker</div>
              <div className="text-white text-xlarge font-bold">& Web3 Developer API</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-white text-medium"><span className="bg-white text-black font-bold py-1 px-4">For Users:</span> Track your assets in real time using DeCommas API</div>
              <div className="text-white text-medium"><span className="bg-white text-black font-bold py-1 px-4">For Developers:</span> Use robust DeCommas API to fetch user data</div>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/portfolio" className="border border-white text-white hover:bg-white hover:text-black hover:cursor-pointer py-2 px-4 transition">Portfolio</Link>
            <Link href="/portfolio" className="border border-white text-white hover:bg-white hover:text-black hover:cursor-pointer py-2 px-4 transition">Developer Portal</Link>
            <div onClick={() => signIn('google')} className="text-white">test</div>
          </div>
        </div>
        {/*<Image src={ethereum} width={350} alt="Ethereum" className="mr-16 xl:block sm:hidden"/>*/}
      </div>
      <div className="text-white opacity-75">I'm the one who buidls</div>
    </main>
  )
}
