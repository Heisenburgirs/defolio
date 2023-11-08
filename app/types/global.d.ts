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
    menuItems: string[];
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
}

// Export to satisfy the TypeScript compiler
export {};
