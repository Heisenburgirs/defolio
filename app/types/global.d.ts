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

  interface PortfolioValueProps {
    balance: number;
    currencySymbol: string;
    balanceVisible: boolean;
    setBalanceVisible: (visible: boolean) => void;
  }

  // SearchBar
  interface SearchBarProps {
    placeholder: string;
    onSearch: (searchValue: string) => void;
  }

  // Toast
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

  // Token Table
  type TokenRow = {
    Address: string;
    Name: string;
    Symbol: string;
    Price: string;
    TokenAmount: string;
    TokenValue: string;
    TokenID: string[];
  };
  
  interface TokenBalances {
    LSP7: TokenRow[];
    LSP8: TokenRow[];
  }

  // Controller Permissions
  interface Permissions {
    ADDCONTROLLER: boolean;
    ADDEXTENSIONS: boolean;
    ADDUNIVERSALRECEIVERDELEGATE: boolean;
    CALL: boolean;
    CHANGEEXTENSIONS: boolean;
    CHANGEOWNER: boolean;
    CHANGEUNIVERSALRECEIVERDELEGATE: boolean;
    DECRYPT: boolean;
    DELEGATECALL: boolean;
    DEPLOY: boolean;
    EDITPERMISSIONS: boolean;
    ENCRYPT: boolean;
    EXECUTE_RELAY_CALL: boolean;
    REENTRANCY: boolean;
    SETDATA: boolean;
    SIGN: boolean;
    STATICCALL: boolean;
    SUPER_CALL: boolean;
    SUPER_DELEGATECALL: boolean;
    SUPER_SETDATA: boolean;
    SUPER_STATICCALL: boolean;
    SUPER_TRANSFERVALUE: boolean;
    TRANSFERVALUE: boolean;
  }  

  interface ControllerPermission {
    address: string;
    permissions: Permission;
  }

  interface ToggleSwitchProps {
    isToggled: boolean;
    onToggle: () => void;
    controllerAddress: string;
    permissionKey: string;
  }

  type VisibilityState = {
    [key: string]: boolean;
  };
  
  // Permissions Menu Items
  type PermissionKey = keyof typeof permissionMapping;

  // Encoding Permissions
  interface PermissionsEncoded {
    [key: string]: boolean;
  }

  // Tokentype selector
  type TokenTypeProps = {
    tokenType: TokenType;
    setTokenType: React.Dispatch<React.SetStateAction<TokenType>>;
  };
}

// Export to satisfy the TypeScript compiler
export {};
