import React, { ReactNode } from 'react';
import { AssetsProvider } from './AssetsContext/AssetsContext';
import { KeymanagerProvider } from './KeymanagerContext/KeymanagerContext';
import { VaultProvider } from './VaultContext/VaultContext';
import { SessionKeysprovider } from './SessionContext/SessionContext';

interface GlobalWrapperProps {
  children: ReactNode;
}

const GlobalWrapper: React.FC<GlobalWrapperProps> = ({ children }) => {
  return (
    <SessionKeysprovider>
      <VaultProvider>
        <KeymanagerProvider>
          <AssetsProvider>
            {children}
          </AssetsProvider>
        </KeymanagerProvider>
      </VaultProvider>
    </SessionKeysprovider>
  );
};

export default GlobalWrapper;