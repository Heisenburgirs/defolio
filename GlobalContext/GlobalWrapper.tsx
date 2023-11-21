import React, { ReactNode } from 'react';
import { AssetsProvider } from './AssetsContext/AssetsContext';
import { KeymanagerProvider } from './KeymanagerContext/KeymanagerContext';
import { VaultProvider } from './VaultContext/VaultContext';

interface GlobalWrapperProps {
  children: ReactNode;
}

const GlobalWrapper: React.FC<GlobalWrapperProps> = ({ children }) => {
  return (
    <VaultProvider>
      <KeymanagerProvider>
        <AssetsProvider>
          {children}
        </AssetsProvider>
      </KeymanagerProvider>
    </VaultProvider>
  );
};

export default GlobalWrapper;