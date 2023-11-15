import React, { ReactNode } from 'react';
import { AssetsProvider } from './AssetsContext.tsx/AssetsContext';
import { KeymanagerProvider } from './KeymanagerContext.tsx/KeymanagerContext';

interface GlobalWrapperProps {
  children: ReactNode;
}

const GlobalWrapper: React.FC<GlobalWrapperProps> = ({ children }) => {
  return (
    <KeymanagerProvider>
      <AssetsProvider>
        {children}
      </AssetsProvider>
    </KeymanagerProvider>
  );
};

export default GlobalWrapper;
