"use client"

import Image from 'next/image'
import { useRef, useState } from 'react'
import { useDraggableScroll } from '../utils/useDraggableScroll';

const MenuItem = ({ itemName, selectedMenuItem, menuSelection } : {itemName: string, selectedMenuItem: string, menuSelection: (itemName: string) => void}) => {
  const isSelected = selectedMenuItem === itemName;
  const baseClasses = "min-w-[150px] text-center lg:text-left rounded-15 py-4 px-6 cursor-pointer transition";
  const textClass = isSelected ? "text-white" : "text-purple hover:text-white";
  const bgClass = isSelected ? "bg-purple" : "hover:bg-lightPurple";
  
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

export default function Portfolio() {
  const { ref: ulRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd, onWheel, scrollToElement } = useDraggableScroll();
  const [selectedMenuItem, setSelectedMenuItem] = useState("Key Manager")

  const menuSelection = (itemName: string) => {
    setSelectedMenuItem(itemName);
    // Check that ulRef.current is not null before trying to access its properties
    if (ulRef.current) {
      // Cast the returned Element to an HTMLElement
      const menuItemElement = ulRef.current.querySelector(`li[data-name="${itemName}"]`) as HTMLElement;
      if (menuItemElement) {
        scrollToElement(menuItemElement);
      }
    }
  };

  const menuItems = ["Key Manager", "Guardians", "Session Keys", "Inheritance", "Carbon"];

  return (
    <main className="flex flex-col lg:flex-row w-full h-full sm:px-4 sm:py-6 md:px-8 md:py-8 lg:px-8 lg:py-8 gap-8">
      <section className="flex flex-col gap-10 w-full lg:w-1/5  bg-white rounded-15 shadow px-6 py-8">
        <h1 className="text-medium px-6 font-bold text-purple">Dashboard</h1>
        <ul 
          ref={ulRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onWheel={onWheel} className="flex w-full overflow-x-auto lg:h-full flex-row lg:flex-col gap-6 text-xsmall sm:py-4 lg:py-0">
          {menuItems.map((item) => (
            <MenuItem
              key={item}
              itemName={item}
              selectedMenuItem={selectedMenuItem}
              menuSelection={menuSelection}
            />
          ))}  
        </ul>
      </section>
      <section className="flex flex-col gap-10 w-full lg:w-4/5 h-full bg-white rounded-15 shadow px-6 py-8">test</section>
    </main>
  )
}
