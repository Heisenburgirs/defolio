"use client"

import Link from 'next/link'
import { useSession } from "next-auth/react";
import Image from 'next/image'
import ethereum from '@/public/ethereum.png'

export default function Landing() {
  const { data: session } = useSession();

  if (session) {
    console.log(session.user?.name);
    console.log(session.user?.email);
  }

  return (
    <main className="flex flex-col w-full h-full sm:px-4 sm:py-4 md:px-8 md:py-12 lg:px-24 lg:py-12 gap-32 justify-center items-center">
      <div className="flex w-full justify-between  p-8 rounded-15">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <div className="text-purple text-large md:text-xlarge font-bold">Universal Profile Management</div>
            </div>
            <div className="text-purple text-medium">Manage your Universal Profile with enhanced tools.</div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex sm:flex-col base:flex-row gap-4 text-purple text-xsmall">
                <div className="border border-lightPurple border-opacity-20 w-[170px] bg-white py-4 px-6 rounded-15 hover:opacity-100 hover:cursor-pointer opacity-90 transition">Inheritance Tools</div>
              <div className="border border-lightPurple border-opacity-20 w-[140px] bg-white py-4 px-6 rounded-15 hover:opacity-100 hover:cursor-pointer opacity-90 transition">Key Manager</div>
            </div>
            <div className="flex sm:flex-col md:flex-row gap-4 text-purple text-xsmall">
              <div className="flex gap-4 sm:flex-col base:flex-row">
              <div className="border border-lightPurple border-opacity-20 w-[140px] bg-white py-4 px-6 rounded-15 hover:opacity-100 hover:cursor-pointer opacity-90 transition text-purple">Carbon Fee</div>
              <div className="border border-lightPurple border-opacity-20 w-[140px] bg-white py-4 px-6 rounded-15 hover:opacity-100 hover:cursor-pointer opacity-90 transition">Session Keys</div>
              </div>
                <div className="border border-lightPurple border-opacity-20 w-[120px] bg-white py-4 px-6 rounded-15 hover:opacity-100 hover:cursor-pointer opacity-90 transition">Guardians</div>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/portfolio" className="text-medium border border-purple focus-white rounded-10 text-white bg-purple hover:bg-white hover:text-purple hover:cursor-pointer py-2 px-4 transition">Open Dapp -{'>'}</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
