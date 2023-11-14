import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import '../../app/globals.css'
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { useAccount } from 'wagmi';
import { ToggleSwitch } from '../toggle/Toggle';
import { PopupButton } from '../popupButton/PopupButton';
import { formatAddress } from '@/app/utils/useFormatAddress';
import { isValidEthereumAddress } from '@/app/utils/useIsValidEthereumAddress';
import { ethers } from 'ethers';
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';

import lightPurpleArrow from '@/public/icons/lightPurple_arrow.png';
import purpleArrow from '@/public/icons/purple_arrow.png';
import { notify, NotificationType } from '../toast/Toast';
import TransactionModal from '../modal/TransactionModal';

const Keymanager = () => {
  const { address, isConnected } = useAccount()
  const [hover, setHover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdditionInitiated, setIsAdditionInitiated] = useState(false);
  const [transactionStep, setTransactionStep] = useState(1);

  // Manage controllers
  const [visibilityStates, setVisibilityStates] = useState<VisibilityState>({});
  const [dropdownVisible, setDropdownVisible] = useState<Record<string, boolean>>({});

  const togglePermissionsDropdown = (controllerAddress: string) => {
    if (visibilityStates[controllerAddress]) {
        // Start closing animation immediately
        setDropdownVisible(prev => ({ ...prev, [controllerAddress]: false }));

        // Delay hiding the dropdown until animation completes
        setTimeout(() => {
            setVisibilityStates(prevStates => ({
                ...prevStates,
                [controllerAddress]: false
            }));
        }, 500); // 500ms matches the duration of the 'conceal' animation
    } else {
        // Open dropdown immediately and start opening animation
        setVisibilityStates(prevStates => ({
            ...prevStates,
            [controllerAddress]: true
        }));
        setDropdownVisible(prev => ({ ...prev, [controllerAddress]: true }));
    }
  };

  // Existing permissions for given addresses
  const [controllersPermissions, setControllersPermissions] = useState<ControllerPermission[]>([]);
  // Adjusted permissions for given addresses
  const [changedPermissions, setChangedPermissions] = useState<Array<{ address: string, changed: string[] }>>([]);

  const updatePermission = (controllerAddress: string, permissionKey: string) => {
    setControllersPermissions(currentPermissions =>
      currentPermissions.map(controller => {
        if (controller.address === controllerAddress) {
          // Update the permissions
          const updatedPermissions = {
            ...controller.permissions,
            [permissionKey]: !controller.permissions[permissionKey]
          };
  
          return { ...controller, permissions: updatedPermissions };
        }
        return controller;
      })
    );
  
    setChangedPermissions(prevState => {
      const existingEntryIndex = prevState.findIndex(entry => entry.address === controllerAddress);
      if (existingEntryIndex !== -1) {
        // Found an existing entry
        const existingEntry = prevState[existingEntryIndex];
        const isAlreadyChanged = existingEntry.changed.includes(permissionKey);
  
        let newChanged;
        if (isAlreadyChanged) {
          // Remove the permissionKey from the changed array
          newChanged = existingEntry.changed.filter(key => key !== permissionKey);
        } else {
          // Add the permissionKey to the changed array
          newChanged = [...existingEntry.changed, permissionKey];
        }
  
        if (newChanged.length === 0) {
          // If no permissions are changed for this address, remove the object completely
          return [
            ...prevState.slice(0, existingEntryIndex),
            ...prevState.slice(existingEntryIndex + 1)
          ];
        } else {
          // Update the changed array for this address
          return [
            ...prevState.slice(0, existingEntryIndex),
            { ...existingEntry, changed: newChanged },
            ...prevState.slice(existingEntryIndex + 1)
          ];
        }
      } else {
        // No existing entry, add a new one
        return [...prevState, { address: controllerAddress, changed: [permissionKey] }];
      }
    });
  };  

  const test =async() => {
  }

  const fetchControllersPermissions = async () => {
    setIsLoading(true)
    const erc725 = new ERC725(LSP6Schema as ERC725JSONSchema[], address, 'https://rpc.testnet.lukso.gateway.fm');

    // Array of controller addresses on given UP
    const addressesWithPerm = await erc725.getData('AddressPermissions[]');
    console.log("addressesWithPerm", addressesWithPerm);
    
    const existingControllers = Array.isArray(addressesWithPerm.value) ? addressesWithPerm.value : [];

    const newControllersPermissions = [];

    for (const controllerAddress of existingControllers) {
      const addressPermission = await erc725.getData({
        keyName: 'AddressPermissions:Permissions:<address>',
        dynamicKeyParts: controllerAddress,
      });
  
      if (addressPermission && typeof addressPermission.value === 'string') {
        const decodedPermission = erc725.decodePermissions(addressPermission.value);
        newControllersPermissions.push({ 
          address: controllerAddress, 
          permissions: decodedPermission 
        });
      } else {
        console.error(`addressPermission.value for ${controllerAddress} is not a string or is null`);
      }
    }

    setControllersPermissions(newControllersPermissions);
    setChangedPermissions([]);
    setIsLoading(false)
  }

  // Fetch controllers & their permissions
  useEffect(() => {
    if (isConnected) {
      fetchControllersPermissions();
    }
  }, [address]);

  
  const [arePermissionsChanged, setArePermissionsChanged] = useState(false)

  useEffect(() => {
    if (changedPermissions.length > 0) {
      setArePermissionsChanged(true);
    } else {
      setArePermissionsChanged(false);
    }
  }, [changedPermissions])

  const handleReset = () => {
    // Clear everything from changedPermissions
    setChangedPermissions([]);
  
    // Reset the controllersPermissions to their original state
    // This requires reverting the changes made to the permissions
    setControllersPermissions(currentPermissions =>
      currentPermissions.map(controller => {
        // Find if there were any changes for this controller
        const changesForController = changedPermissions.find(change => change.address === controller.address);
  
        if (changesForController) {
          // Revert the changes
          const revertedPermissions = { ...controller.permissions };
  
          changesForController.changed.forEach(permissionKey => {
            revertedPermissions[permissionKey] = !revertedPermissions[permissionKey];
          });
  
          return { ...controller, permissions: revertedPermissions };
        }
  
        return controller;
      })
    );
  };

  // Existing Controller Permissions
  const handleConfirm = () => {
    console.log("Permissions changed");

  };

  // Dynamic render of permissions
  const menuItems: string[] = [
    "Add Controller",
    "Add Extensions",
    "Add Universal Receiver Delegate",
    "Call",
    "Change Extensions",
    "Change Owner",
    "Change Universal Receiver Delegate",
    "Decrypt",
    "Delegate Call",
    "Deploy",
    "Edit Permissions",
    "Ecnrypt",
    "Eexecute Relay Call",
    "Reentrancy",
    "Set Data",
    "Sign",
    "Static Call",
    "Super Call",
    "Super Delegate Call",
    "Super Set Data",
    "Super Static Call",
    "Super Transfer Value",
    "Transfer Value"
  ];

  const permissionMapping = {
  "ADDCONTROLLER": "Add Controller",
  "ADDEXTENSIONS": "Add Extensions",
  "ADDUNIVERSALRECEIVERDELEGATE": "Add Universal Receiver Delegate",
  "CALL": "Call",
  "CHANGEEXTENSIONS": "Change Extensions",
  "CHANGEOWNER": "Change Owner",
  "CHANGEUNIVERSALRECEIVERDELEGATE": "Change Universal Receiver Delegate",
  "DECRYPT": "Decrypt",
  "DELEGATECALL": "Delegate Call",
  "DEPLOY": "Deploy",
  "EDITPERMISSIONS": "Edit Permissions",
  "ENCRYPT": "Ecnrypt",
  "EXECUTE_RELAY_CALL": "Eexecute Relay Call",
  "REENTRANCY": "Reentrancy",
  "SETDATA": "Set Data",
  "SIGN": "Sign",
  "STATICCALL": "Static Call",
  "SUPER_CALL": "Super Call",
  "SUPER_DELEGATECALL": "Super Delegate Call",
  "SUPER_SETDATA": "Super Set Data",
  "SUPER_STATICCALL": "Super Static Call",
  "SUPER_TRANSFERVALUE": "Super Transfer Value",
  "TRANSFERVALUE": "Transfer Value",
  };


  const chunkSizes: number[] = [4, 4, 5, 5, 3, 2];

  const dynamicChunkArray = (array: string[], sizes: number[]): string[][] => {
    let index = 0;
    return sizes.map((size) => {
      const chunk = array.slice(index, index + size);
      index += size;
      return chunk;
    });
  };

  const chunkedMenuItems = dynamicChunkArray(menuItems, chunkSizes);
  
  type PermissionKey = keyof typeof permissionMapping;

  const selectPermissions = (permission: string) => {
    setSelectedPermissions(prevSelected => {
      // Find the key in permissionMapping that corresponds to the selected permission
      const permissionKey = Object.keys(permissionMapping).find(key => permissionMapping[key as PermissionKey] === permission) as PermissionKey | undefined;
  
      if (!permissionKey) {
        // If there is no corresponding key, return the previous state
        return prevSelected;
      }
  
      if (prevSelected.includes(permissionKey)) {
        // Remove the key if it's already selected
        return prevSelected.filter(item => item !== permissionKey);
      } else {
        // Add the key if it's not already selected
        return [...prevSelected, permissionKey];
      }
    });
  };
  
  // Add New Controller
  const [addController, setAddController] = useState<boolean>(false);
  const [hasProvidedAddress, setHasProvidedAddress] = useState<boolean>(false);
  const [inputAddress, setInputAddress] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  
  const addNewController = async () => {

    // Check if the input address is already a controller
    const isAlreadyController = controllersPermissions.some(controller => controller.address === inputAddress);

    if (isAlreadyController) {
      notify("Address Already Controller", NotificationType.Error)
      return;
    }

    if (selectedPermissions.length === 0) {
      notify("Select Permission", NotificationType.Error)
      return;
    }

    setIsAdditionInitiated(true)

    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();

    const erc725 = new ERC725(
      LSP6Schema as ERC725JSONSchema[],
      address,
      'https://rpc.testnet.lukso.network'
    );

    // Create an object with these keys, each set to true
    const permissionsObject = selectedPermissions.reduce<PermissionsEncoded>((acc, permission) => {
      acc[permission] = true;
      return acc;
    }, {});

    console.log("permissionsObject", permissionsObject)

    // Now encode the permissions using erc725.encodePermissions
    const beneficiaryPermissions = erc725.encodePermissions(permissionsObject);

    const addressPermissionsArray = await erc725.getData('AddressPermissions[]');
    const controllers = addressPermissionsArray.value;
    console.log("controllers", controllers)

    if (!Array.isArray(controllers)) {
      notify("Unexpected Error", NotificationType.Error);
      throw new Error('Controllers is not an array');
    }

    const permissionData = erc725.encodeData([
      // the permission of the beneficiary address
      {
        keyName: 'AddressPermissions:Permissions:<address>',
        dynamicKeyParts: inputAddress,
        value: beneficiaryPermissions,
      },
      // the new list controllers addresses (= addresses with permissions set on the UP)
      // + the incremented `AddressPermissions[]` array length
      {
        keyName: 'AddressPermissions[]',
        // @ts-ignore
        value: [...controllers, inputAddress],
      },
    ]);

    //@ts-ignore
    const myUniversalProfile = new ethers.Contract(address, UniversalProfile.abi, signer);

    try {
      const tx = await myUniversalProfile.setDataBatch(permissionData.keys, permissionData.values);
      setTransactionStep(2)

      const receipt = await tx.wait();
      setTransactionStep(3)
      setSelectedPermissions([''])

    } catch (err) {
      // First, check if err is an object and has a 'code' property
      if (typeof err === 'object' && err !== null && 'code' in err) {
        // Now TypeScript knows err is an object and has a 'code' property
        const errorCode = (err as { code: unknown }).code;
        if (errorCode === 4001) {
          // Handle user's rejection
          console.log("User declined the transaction");
          notify("Signature Declined", NotificationType.Error);
          setIsAdditionInitiated(false)
          setSelectedPermissions([''])
        } else {
          // Handle other errors
          console.log("ERROR SETTING CONTROLLER", err);
          setIsAdditionInitiated(true)
          notify("Error Setting Controller", NotificationType.Error);
          setTransactionStep(4);
          setSelectedPermissions([''])
        }
      } else {
        // Handle the case where err is not an object or doesn't have 'code'
        console.log("An unexpected error occurred", err);
        setSelectedPermissions([''])
        setTransactionStep(4);
      }
    }
  }

  return (
    <div className={`flex flex-col gap-6 h-full bg-white rounded-15 shadow px-6 py-8 ${addController ? 'animate-fade-out' : 'animate-fade-in'} transition`}>
      
      {addController ? (
        isAdditionInitiated ? (
          <TransactionModal
            successMsg='Controller Successfuly Set'
            onBackButtonClick={() => {setAddController(false)}} 
            transactionStep={transactionStep}
            setTransactionStep={setTransactionStep}
          />
        )
        :
        (
          <>
            <div
              className="flex gap-2 px-4 items-center text-lightPurple hover:text-purple hover:cursor-pointer transition text-small"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onClick={() => {setAddController(false)}}
            >
              <div 
                className="transition ease-in-out duration-200"
              >
                <Image 
                  src={hover ? purpleArrow : lightPurpleArrow} 
                  width={24} 
                  height={24} 
                  alt="Back"
                  className="hover:cursor-pointer"
                />
              </div>
              <div>Back</div>
            </div>
            <div className="flex flex-col py-6 px-16 gap-16 justify-center items-center">
              <div className="flex flex-col gap-4 justify-center items-center">
                <div className="text-purple font-bold text-medium">Add New Controller</div>
                <div className="text-lightPurple text-medium">Choose permissions you wish this controller to have on your Universal Profile</div>
              </div>
              <input 
                type="text" 
                placeholder="Enter address..." 
                className="px-4 py-2 w-[500px] border border-lightPurple rounded-15 focus:outline-purple"
                onChange={(e) => { setInputAddress(e.target.value); setHasProvidedAddress(isValidEthereumAddress(e.target.value));}}
              />
              <div className="flex w-full flex-col gap-4 items-center justify-center">
                {chunkedMenuItems.map((chunk, chunkIndex) => (
                  <div key={chunkIndex} className="flex gap-2">
                    {chunk.map((item, itemIndex) => {
                      // Find the key in permissionMapping that corresponds to the display value
                      const permissionKey = Object.keys(permissionMapping).find(key => permissionMapping[key as PermissionKey] === item);
  
                      // Check if this key is in the selectedPermissions array
                      const isSelected = permissionKey && selectedPermissions.includes(permissionKey as PermissionKey);
  
                      return (
                        <div 
                          key={itemIndex} 
                          className={`py-2 px-4 border border-lightPurple hover:bg-purple hover:text-white hover:cursor-pointer rounded-15 text-xsmall transition ${isSelected ? "bg-purple text-white opacity-100" : "text-lightPurple"}`}
                          onClick={() => selectPermissions(item)}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <button 
                className={
                  `py-2 px-6 bg-lightPurple bg-opacity-75 text-medium rounded-15 text-white transition
                  ${hasProvidedAddress ? 'bg-purple bg-opacity-100' : 'cursor-not-allowed opacity-50'}`
                }
                onClick={addNewController}
                disabled={!hasProvidedAddress}
              >
                Finalize Controller
              </button>
            </div>
          </>
        )
      )
      :
      (
      <>
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="text-medium font-bold text-purple">Controller Permissions</div>
            <div className="sm:text-xsmall md:text-small text-purple opacity-90">Remove, add and manage controller permissions</div>
          </div>
          <div onClick={() => { if (isConnected) setAddController(true) }}  className="py-2 px-4 rounded-15 text-xsmall border border-lightPurple text-purple font-bold hover:cursor-pointer hover:bg-purple hover:text-white transition">
            Add Controller
          </div>
        </div>
        <PopupButton isVisible={arePermissionsChanged} onReset={handleReset} onConfirm={handleConfirm}/>
        <div className="flex flex-col w-full gap-2">
          <div className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12">
            <div className="flex w-full justify-between items-center">
              <div className="text-purple font-bold flex opacity-75">
                Controllers
              </div>
              <div className="text-purple font-bold flex opacity-75">
                Permissions
              </div>
            </div>
          </div>

        {isLoading ? (
          <div className="loading opacity-75 w-full flex justify-center items-center p-16">
            <span className="loading__dot"></span>
            <span className="loading__dot"></span>
            <span className="loading__dot"></span>
          </div>
        )
        :
        (
          controllersPermissions.map((controller, index) => (
            <div key={index} className="hidden sm:table-header-group grid grid-cols-12 border border-lightPurple border-opacity-25 rounded-15 py-2 px-4">
              <div  className="flex w-full justify-between items-center py-2">
                <div className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal">
                  <div onClick={test} className="text-small font-bold">{formatAddress(controller.address)}</div>
                </div>
                <div className="sm:hidden base:block sm:col-span-1 lg:col-span-4 text-purple font-normal flex">
                  <div onClick={() => {togglePermissionsDropdown(controller.address)}} className="font-bold text-xsmall transition hover:cursor-pointer">show more</div>
                </div>
              </div> 
              {visibilityStates[controller.address] && (
                <div 
                  className={`flex w-full ${dropdownVisible[controller.address] ? 'animate-reveal' : 'animate-conceal'} transition gap-2 grid sm:grid-cols-1 keymanager:grid-cols-2 lg:grid-cols-3 text-xsmall overflow-y-auto hide-scrollbar`}
                  style={{ animationFillMode: 'forwards' }}
                >
                  <div className="flex flex-col gap-4 py-2">
                    <div className="font-bold text-purple">
                      Ownership
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch 
                          isToggled={controller.permissions.CHANGEOWNER}
                          onToggle={() => updatePermission(controller.address, 'CHANGEOWNER')} 
                          controllerAddress={controller.address}
                          permissionKey="CHANGEOWNER"
                        />
                        <span>Change Owner</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.ADDCONTROLLER}
                          onToggle={() => updatePermission(controller.address, 'ADDCONTROLLER')} 
                          controllerAddress={controller.address}
                          permissionKey="ADDCONTROLLER"
                        />
                        <span>Add Controller</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.EDITPERMISSIONS}
                          onToggle={() => updatePermission(controller.address, 'EDITPERMISSIONS')} 
                          controllerAddress={controller.address}
                          permissionKey="EDITPERMISSIONS"
                        />
                        <span>Edit Permissions</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-2">
                    <div className="font-bold text-purple">
                      Signature
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.ENCRYPT}
                          onToggle={() => updatePermission(controller.address, 'ENCRYPT')} 
                          controllerAddress={controller.address}
                          permissionKey="ENCRYPT"
                        />
                        <span>Encrypt</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.DECRYPT}
                          onToggle={() => updatePermission(controller.address, 'DECRYPT')} 
                          controllerAddress={controller.address}
                          permissionKey="DECRYPT"
                        />
                        <span>Decrypt</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SIGN}
                          onToggle={() => updatePermission(controller.address, 'SIGN')} 
                          controllerAddress={controller.address}
                          permissionKey="SIGN"
                        />
                        <span>Sign</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-2">
                    <div className="font-bold text-purple">
                      Asset Management
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_TRANSFERVALUE}
                          onToggle={() => updatePermission(controller.address, 'SUPER_TRANSFERVALUE')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_TRANSFERVALUE"
                        />
                        <span>Super Transfer Value</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.TRANSFERVALUE}
                          onToggle={() => updatePermission(controller.address, 'TRANSFERVALUE')} 
                          controllerAddress={controller.address}
                          permissionKey="TRANSFERVALUE"
                        />
                        <span>Transfer Value</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-2">
                    <div className="font-bold text-purple">
                      Calls
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_CALL}
                          onToggle={() => updatePermission(controller.address, 'SUPER_CALL')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_CALL"
                        />
                        <span>Super Call</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.CALL}
                          onToggle={() => updatePermission(controller.address, 'CALL')} 
                          controllerAddress={controller.address}
                          permissionKey="CALL"
                        />
                        <span>Call</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_STATICCALL}
                          onToggle={() => updatePermission(controller.address, 'SUPER_STATICCALL')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_STATICCALL"
                        />
                        <span>Super Static Call</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.STATICCALL}
                          onToggle={() => updatePermission(controller.address, 'STATICCALL')} 
                          controllerAddress={controller.address}
                          permissionKey="STATICCALL"
                        />
                        <span>Static Call</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_DELEGATECALL}
                          onToggle={() => updatePermission(controller.address, 'SUPER_DELEGATECALL')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_DELEGATECALL"
                        />
                        <span>Super Delegate Call</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.DELEGATECALL}
                          onToggle={() => updatePermission(controller.address, 'DELEGATECALL')} 
                          controllerAddress={controller.address}
                          permissionKey="DELEGATECALL"
                        />
                        <span>Delegate Call</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-2 keymanager:mt-[-150px] lg:mt-0">
                    <div className="font-bold text-purple">
                      Extensions
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.ADDEXTENSIONS}
                          onToggle={() => updatePermission(controller.address, 'ADDEXTENSIONS')} 
                          controllerAddress={controller.address}
                          permissionKey="ADDEXTENSIONS"
                        />
                        <span>Add Extensions</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.CHANGEEXTENSIONS}
                          onToggle={() => updatePermission(controller.address, 'CHANGEEXTENSIONS')} 
                          controllerAddress={controller.address}
                          permissionKey="CHANGEEXTENSIONS"
                        />
                        <span>Change Extensions</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.ADDUNIVERSALRECEIVERDELEGATE}
                          onToggle={() => updatePermission(controller.address, 'ADDUNIVERSALRECEIVERDELEGATE')} 
                          controllerAddress={controller.address}
                          permissionKey="ADDUNIVERSALRECEIVERDELEGATE"
                        />
                        <span>Add URD</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.CHANGEUNIVERSALRECEIVERDELEGATE}
                          onToggle={() => updatePermission(controller.address, 'CHANGEUNIVERSALRECEIVERDELEGATE')} 
                          controllerAddress={controller.address}
                          permissionKey="CHANGEUNIVERSALRECEIVERDELEGATE"
                        />
                        <span>Change URD</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-2  md:mt-0">
                    <div className="font-bold text-purple">
                      Relay & Execution
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.EXECUTE_RELAY_CALL}
                          onToggle={() => updatePermission(controller.address, 'EXECUTE_RELAY_CALL')} 
                          controllerAddress={controller.address}
                          permissionKey="EXECUTE_RELAY_CALL"
                        />
                        <span>Execute Relay Call</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-2 keymanager:mt-[-20px] lg:mt-0">
                    <div className="font-bold text-purple">
                      Contract Management
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.DEPLOY}
                          onToggle={() => updatePermission(controller.address, 'DEPLOY')} 
                          controllerAddress={controller.address}
                          permissionKey="DEPLOY"
                        />
                        <span>Deploy</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_SETDATA}
                          onToggle={() => updatePermission(controller.address, 'SUPER_SETDATA')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_SETDATA"
                        />
                        <span>Super Set Data</span>
                      </div>
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SETDATA}
                          onToggle={() => updatePermission(controller.address, 'SETDATA')} 
                          controllerAddress={controller.address}
                          permissionKey="SETDATA"
                        />
                        <span>Set Data</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 py-2 base:grid-row-6">
                    <div className="font-bold text-purple">
                      Safety
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.REENTRANCY}
                          onToggle={() => updatePermission(controller.address, 'REENTRANCY')} 
                          controllerAddress={controller.address}
                          permissionKey="REENTRANCY"
                        />
                        <span>Reentrancy</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))

        )}
          
        </div>
      </>
      )}
    </div>
  );
};

export default Keymanager