declare global {
  interface Window {
    ethereum?: any;
    lukso?: any;
  }

  //Navbar
  type MenuSelectionFunction = (itemName: string) => void;

  interface NavbarProps {
    selectedMenuItem: string;
    menuSelection: MenuSelectionFunction;
    menuItems: string[]
  }

  interface MenuItemProps {
    itemName: string;
    selectedMenuItem: string;
    menuSelection: MenuSelectionFunction;
  }

  // Currency dropdown
  type OnSelectFunction = (currency: CurrencyOption) => void;

  interface CurrencyDropdownProps {
    selectedCurrency: CurrencyOption;
    onSelect: OnSelectFunction;
  }

  interface CurrencyOption {
    symbol: string;
    name: string;
    image: StaticImageData;
  }

  
  interface CustomUListElement extends HTMLUListElement {
    startX?: number;
    scrollLeftStart?: number;
  }

  // Portfolio balance
  type CurrencyOption = {
    label: string;
    symbol: keyof typeof convertedBalances;
  };

  type PortfolioValueProps = {
    balance: number;
    currencySymbol: string;
  };

  // SearchBar
  interface SearchBarProps {
    placeholder: string;
  }

  // Toast
  enum NotificationType {
    Success,
    Error,
    Warning,
    Info,
    Default,
  }

  interface NotificationProviderProps {
    children: ReactNode;
  }

  // CurrencyContext
  interface CurrencyData {
    GBP: number;
    EUR: number;
    [key: string]: number;
  }

  interface CurrencyDataContextValue {
    currencyData: CurrencyData;
    error: string;
    loading: boolean;
  }
  
  interface CurrencyDataProviderProps {
    children: ReactNode;
  }
}

// Export to satisfy the TypeScript compiler
export {};
