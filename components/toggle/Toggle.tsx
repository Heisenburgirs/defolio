import React from 'react';

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isToggled, onToggle, controllerAddress, permissionKey }) => {
  const toggleId = `toggle-${controllerAddress}-${permissionKey}`;

  return (
    <div onClick={onToggle} className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        name="toggle"
        id={toggleId}
        checked={isToggled}
        className="toggle-checkbox absolute block rounded-15 w-5 h-5 rounded-full bg-white appearance-none cursor-pointer"
        style={{ top: '2px', left: isToggled ? '26px' : '2px', transition: 'left 0.2s' }}
      />
      <label
        className={`toggle-label block overflow-hidden h-6 w-12 rounded-full ${isToggled ? "bg-green bg-opacity-100" : "bg-black bg-opacity-20"} rounded-15 px-2 cursor-pointer`}
        style={{ padding: '2px' }}
      ></label>
    </div>
  );
};  