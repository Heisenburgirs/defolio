import React from 'react';

const Navbar = ({ selectedMenuItem, menuSelection, menuItems }: NavbarProps) => {
  return (
    <ul className="flex w-full overflow-x-auto lg:h-full flex-row lg:flex-col gap-6 text-xsmall sm:py-4 lg:py-0">
      {menuItems.map((item) => (
        <MenuItem
          key={item}
          itemName={item}
          selectedMenuItem={selectedMenuItem}
          menuSelection={menuSelection}
        />
      ))}  
    </ul>
  );
};

const MenuItem = ({ itemName, selectedMenuItem, menuSelection }: MenuItemProps) => {
  const isSelected = selectedMenuItem === itemName;
  const baseClasses = "min-w-[150px] lg:text-left rounded-15 flex sm:items-center sm:justify-center lg:items-left lg:justify-start lg sm:py-2 lg:py-4 px-6 cursor-pointer transition";
  const textClass = isSelected ? "text-white" : "text-purple hover:text-white";
  const bgClass = isSelected ? "bg-lightPurple" : "hover:bg-lightPurple";
  
  return (
    <li
      data-name={itemName}
      onClick={() => menuSelection(itemName)}
      className={`${baseClasses} ${textClass} ${bgClass}`}
    >
      {itemName}
    </li>
  );
};

export default Navbar;