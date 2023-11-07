"use client"

import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] })

type RootLayoutProps = {
  children: React.ReactNode,
  session: any
}

export default function RootLayout({ children, session }: RootLayoutProps) {
  
  return (
    <html lang="en">
      <body className={`${inter.className} sm:bg-background flex flex-col h-[100vh]`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}