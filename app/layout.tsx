"use client"

import { Inter } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import '@rainbow-me/rainbowkit/styles.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ToastProvider from '@/components/toast/ToastProvider'
import { CurrencyDataProvider } from '@/components/context/CurrencyContext';

// Rainbowkit/Wagmi
import merge from 'lodash.merge';
import { RainbowKitProvider, connectorsForWallets, lightTheme, Theme } from '@rainbow-me/rainbowkit';
import { Chain, configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

// Lukso chain configuration
const LUKSO_TESTNET: Chain = {
  id: 4201,
  name: 'LUKSO TESTNET',
  network: 'LUKSO TESTNET',
  nativeCurrency: {
    decimals: 18,
    name: 'LUKSO',
    symbol: 'LYXt',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.lukso.network'] },
    public: { http: ['https://rpc.testnet.lukso.network'] },
  },
  blockExplorers: {
    default: { name: 'Lukso Testnet Explorer', url: 'https://explorer.execution.testnet.lukso.network/' },
  },
  testnet: true,
};

// Rainbowkit Theme
const customTheme = merge(lightTheme(), {
  colors: {
    accentColor: '#8993d1',
    accentColorForeground: 'white',
  }
} as Theme);

const luksoWalletConnector = () => ({
  id: 'Universal Profile',
  name: 'Universal Profile',
  iconUrl: 'https://wallet.universalprofile.cloud/assets/images/up-logo.png',
  iconBackground: '#646eb5',
  downloadUrls: {
    chrome: 'https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en',
  },
  createConnector: () => {
    const connector = new InjectedConnector({
      chains: [LUKSO_TESTNET],
      options: {
        getProvider: () => (typeof window !== 'undefined' && window.lukso ? window.lukso : undefined),
        name: 'Universal Profile',
      },
    },
    );

    // Now you can use the connector object to interact with the Lukso wallet
    return {
      connector,
      // You can define the mobile, desktop, qrCode, and extension properties if needed
      // For example, if you want to provide instructions on how to install the Lukso wallet
      /*extension: {
        instructions: {
          learnMoreUrl: 'https://universalprofile.cloud/',
          steps: [
            {
              description:
                'Create your Universal Profile and get ready for a new kind of DApp experience!',
              step: 'install',
              title: 'Install Universal Profile',
            },
            {
              description:
                'Create new Universal Profile sponsored by Lukso',
              step: 'create',
              title: 'Create Universal Profile',
            },
            {
              description:
                'Once you set up your wallet, click below to refresh the browser and load up the extension.',
              step: 'refresh',
              title: 'Refresh your browser',
            },
          ],
        },
      },*/
    };
  },
});

const { chains, publicClient } = configureChains(
  [LUKSO_TESTNET],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: `https://rpc.testnet.lukso.network`,
      }),
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Universal Profile',
    wallets: [
      luksoWalletConnector()
    ],  
  },
]);

const wagmiConfig = createConfig({
  connectors,
  publicClient
})

const inter = Inter({ subsets: ['latin'] })

type RootLayoutProps = {
  children: React.ReactNode,
  session: any
}

export default function RootLayout({ children, session }: RootLayoutProps) {
  
  return (
    <html lang="en">
      <body className={`${inter.className} sm:bg-background flex flex-col justify-between h-[100vh]`}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} theme={customTheme}>
            <ToastProvider>
              <CurrencyDataProvider>
                <Header />
                {children}
                <Footer />
              </CurrencyDataProvider>
            </ToastProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}