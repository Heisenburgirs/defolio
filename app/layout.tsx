"use client"

import { Inter } from 'next/font/google';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import { Header } from '../components/Header';
import Footer from '../components/Footer';

// Rainbowkit/Wagmi
import merge from 'lodash.merge';
import { RainbowKitProvider, connectorsForWallets, lightTheme, Theme } from '@rainbow-me/rainbowkit';
import { Chain, configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { InjectedConnector } from 'wagmi/connectors/injected'

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
  },
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
        getProvider: () => window.lukso,
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
      rpc: (chain) => {
        if (chain.id === LUKSO_TESTNET.id) {
          const returnObj = LUKSO_TESTNET.rpcUrls.default.http.toString()
          const replace = returnObj.replace(/""/g, '')
          return { http: replace }
        }
        // Return null or undefined for chains that do not use this provider
        return null;
      },
    }),
    publicProvider()
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
      <body className={`${inter.className} sm:bg-background flex flex-col h-[100vh]`}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} theme={customTheme}>
            <Header />
            {children}
            <Footer />
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}