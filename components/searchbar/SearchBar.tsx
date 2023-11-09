// SearchBar.tsx
import React from 'react';
import Image from 'next/image';
import searchIcon from '@/public/icons/search.png';

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="focus:outline-purple text-xsmall py-2.5 base:pl-10 sm:px-12 base:px-4 md:px-10 bg-background border border-lightPurple border-opacity-75 rounded-15"
      />
      <Image
        src={searchIcon}
        width={16}
        height={16}
        alt="Search"
        className="absolute left-0 ml-4 top-1/2 transform -translate-y-1/2"
      />
    </div>
  );
};

export default SearchBar;
