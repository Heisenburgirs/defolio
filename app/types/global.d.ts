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
  type TableRow = {
    Name: string[];
    Symbol: string[];
    Price: string[];
    Change24: string[];
    TokenAmount: string[];
    TokenValue: string[];
  };

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
}

// Export to satisfy the TypeScript compiler
export {};
