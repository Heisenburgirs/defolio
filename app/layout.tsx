"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ['latin'] })

type RootLayoutProps = {
  children: React.ReactNode,
  session: any
}

export default function RootLayout({ children, session }: RootLayoutProps) {
  
  
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={`${inter.className} sm:bg-black`}>
          <Header />
          {children}
        </body>
      </html>
    </SessionProvider>
  )
}