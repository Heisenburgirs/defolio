import React, { useState, useEffect } from 'react';
import '../../app/globals.css'
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { useAccount } from 'wagmi';
import { ToggleSwitch } from '../toggle/Toggle';
import { Test } from '../popupButton/PopupButton';

const Keymanager = () => {
  const { address } = useAccount()

  const [visibilityStates, setVisibilityStates] = useState<VisibilityState>({});
  const [dropdownVisible, setDropdownVisible] = useState<Record<string, boolean>>({});

  const togglePermissionsDropdown = (controllerAddress: string) => {
    if (visibilityStates[controllerAddress]) {
      // If dropdown is currently open, start closing animation
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

  const test = () => {
    console.log(changedPermissions)
  }

  const fetchControllersPermissions = async () => {
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
  }

  // Fetch controllers & their permissions
  useEffect(() => {
    fetchControllersPermissions();
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

  const handleConfirm = () => {
    console.log("Permissions changed");
  };

  
  return (
    
      <div className="flex h-full bg-white rounded-15 shadow px-6 py-8">
        <Test isVisible={arePermissionsChanged} onReset={handleReset} onConfirm={handleConfirm}/>
        <div className="flex flex-col w-full gap-2">
          <thead className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12">
            <tr className="flex w-full justify-between items-center">
              <th className="text-purple font-bold flex">
                Controllers
              </th>
              <th className="text-purple font-bold flex">
                Permissions
              </th>
            </tr>
          </thead>

          {controllersPermissions.map((controller, index) => (
            <tbody key={index} className="hidden sm:table-header-group grid grid-cols-12 border border-lightPurple border-opacity-25 rounded-15 py-2 px-4">
              <tr  className="flex w-full justify-between items-center py-2">
                <td className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal">
                  <td onClick={test} className="text-small font-bold">{controller.address}</td>
                </td>
                <td className="sm:hidden base:block sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75 flex">
                  <td onClick={() => {togglePermissionsDropdown(controller.address)}} className="font-bold text-xsmall opacity-90 hover:opacity-100 transition hover:cursor-pointer">show more</td>
                </td>
              </tr> 
              {visibilityStates[controller.address] && (
                <tr 
                  className={`flex w-full ${dropdownVisible[controller.address] ? 'animate-reveal' : 'animate-conceal'} transition gap-2 grid sm:grid-cols-1 keymanager:grid-cols-2 lg:grid-cols-3 text-xsmall overflow-y-auto hide-scrollbar`}
                  style={{ animationFillMode: 'forwards' }}
                >
                  <tr className="flex flex-col gap-4 py-2">
                    <td className="font-bold text-purple">
                      Ownership
                    </td>
                    <td className="flex flex-col gap-4">
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch 
                          isToggled={controller.permissions.CHANGEOWNER}
                          onToggle={() => updatePermission(controller.address, 'CHANGEOWNER')} 
                          controllerAddress={controller.address}
                          permissionKey="CHANGEOWNER"
                        />
                        <span>Change Owner</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.ADDCONTROLLER}
                          onToggle={() => updatePermission(controller.address, 'ADDCONTROLLER')} 
                          controllerAddress={controller.address}
                          permissionKey="ADDCONTROLLER"
                        />
                        <span>Add Controller</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.EDITPERMISSIONS}
                          onToggle={() => updatePermission(controller.address, 'EDITPERMISSIONS')} 
                          controllerAddress={controller.address}
                          permissionKey="EDITPERMISSIONS"
                        />
                        <span>Edit Permissions</span>
                      </tr>
                    </td>
                  </tr>
                  <tr className="flex flex-col gap-4 py-2">
                    <td className="font-bold text-purple">
                      Signature
                    </td>
                    <td className="flex flex-col gap-4">
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.ENCRYPT}
                          onToggle={() => updatePermission(controller.address, 'ENCRYPT')} 
                          controllerAddress={controller.address}
                          permissionKey="ENCRYPT"
                        />
                        <span>Encrypt</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.DECRYPT}
                          onToggle={() => updatePermission(controller.address, 'DECRYPT')} 
                          controllerAddress={controller.address}
                          permissionKey="DECRYPT"
                        />
                        <span>Decrypt</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SIGN}
                          onToggle={() => updatePermission(controller.address, 'SIGN')} 
                          controllerAddress={controller.address}
                          permissionKey="SIGN"
                        />
                        <span>Sign</span>
                      </tr>
                    </td>
                  </tr>
                  <tr className="flex flex-col gap-4 py-2">
                    <td className="font-bold text-purple">
                      Asset Management
                    </td>
                    <td className="flex flex-col gap-4">
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_TRANSFERVALUE}
                          onToggle={() => updatePermission(controller.address, 'SUPER_TRANSFERVALUE')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_TRANSFERVALUE"
                        />
                        <span>Super Transfer Value</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.TRANSFERVALUE}
                          onToggle={() => updatePermission(controller.address, 'TRANSFERVALUE')} 
                          controllerAddress={controller.address}
                          permissionKey="TRANSFERVALUE"
                        />
                        <span>Transfer Value</span>
                      </tr>
                    </td>
                  </tr>
                  <tr className="flex flex-col gap-4 py-2">
                    <td className="font-bold text-purple">
                      Calls
                    </td>
                    <td className="flex flex-col gap-4">
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_CALL}
                          onToggle={() => updatePermission(controller.address, 'SUPER_CALL')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_CALL"
                        />
                        <span>Super Call</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.CALL}
                          onToggle={() => updatePermission(controller.address, 'CALL')} 
                          controllerAddress={controller.address}
                          permissionKey="CALL"
                        />
                        <span>Call</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_STATICCALL}
                          onToggle={() => updatePermission(controller.address, 'SUPER_STATICCALL')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_STATICCALL"
                        />
                        <span>Super Static Call</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.STATICCALL}
                          onToggle={() => updatePermission(controller.address, 'STATICCALL')} 
                          controllerAddress={controller.address}
                          permissionKey="STATICCALL"
                        />
                        <span>Static Call</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_DELEGATECALL}
                          onToggle={() => updatePermission(controller.address, 'SUPER_DELEGATECALL')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_DELEGATECALL"
                        />
                        <span>Super Delegate Call</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.DELEGATECALL}
                          onToggle={() => updatePermission(controller.address, 'DELEGATECALL')} 
                          controllerAddress={controller.address}
                          permissionKey="DELEGATECALL"
                        />
                        <span>Delegate Call</span>
                      </tr>
                    </td>
                  </tr>
                  <tr className="flex flex-col gap-4 py-2 keymanager:mt-[-150px] lg:mt-0">
                    <td className="font-bold text-purple">
                      Extensions
                    </td>
                    <td className="flex flex-col gap-4">
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.ADDEXTENSIONS}
                          onToggle={() => updatePermission(controller.address, 'ADDEXTENSIONS')} 
                          controllerAddress={controller.address}
                          permissionKey="ADDEXTENSIONS"
                        />
                        <span>Add Extensions</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.CHANGEEXTENSIONS}
                          onToggle={() => updatePermission(controller.address, 'CHANGEEXTENSIONS')} 
                          controllerAddress={controller.address}
                          permissionKey="CHANGEEXTENSIONS"
                        />
                        <span>Change Extensions</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.ADDUNIVERSALRECEIVERDELEGATE}
                          onToggle={() => updatePermission(controller.address, 'ADDUNIVERSALRECEIVERDELEGATE')} 
                          controllerAddress={controller.address}
                          permissionKey="ADDUNIVERSALRECEIVERDELEGATE"
                        />
                        <span>Add URD</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.CHANGEUNIVERSALRECEIVERDELEGATE}
                          onToggle={() => updatePermission(controller.address, 'CHANGEUNIVERSALRECEIVERDELEGATE')} 
                          controllerAddress={controller.address}
                          permissionKey="CHANGEUNIVERSALRECEIVERDELEGATE"
                        />
                        <span>Change URD</span>
                      </tr>
                    </td>
                  </tr>
                  <tr className="flex flex-col gap-4 py-2  md:mt-0">
                    <td className="font-bold text-purple">
                      Relay & Execution
                    </td>
                    <td className="flex flex-col gap-4">
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.EXECUTE_RELAY_CALL}
                          onToggle={() => updatePermission(controller.address, 'EXECUTE_RELAY_CALL')} 
                          controllerAddress={controller.address}
                          permissionKey="EXECUTE_RELAY_CALL"
                        />
                        <span>Execute Relay Call</span>
                      </tr>
                    </td>
                  </tr>
                  <tr className="flex flex-col gap-4 py-2 keymanager:mt-[-20px] lg:mt-0">
                    <td className="font-bold text-purple">
                      Contract Management
                    </td>
                    <td className="flex flex-col gap-4">
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.DEPLOY}
                          onToggle={() => updatePermission(controller.address, 'DEPLOY')} 
                          controllerAddress={controller.address}
                          permissionKey="DEPLOY"
                        />
                        <span>Deploy</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SUPER_SETDATA}
                          onToggle={() => updatePermission(controller.address, 'SUPER_SETDATA')} 
                          controllerAddress={controller.address}
                          permissionKey="SUPER_SETDATA"
                        />
                        <span>Super Set Data</span>
                      </tr>
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.SETDATA}
                          onToggle={() => updatePermission(controller.address, 'SETDATA')} 
                          controllerAddress={controller.address}
                          permissionKey="SETDATA"
                        />
                        <span>Set Data</span>
                      </tr>
                    </td>
                  </tr>
                  
                  <tr className="flex flex-col gap-4 py-2 base:grid-row-6">
                    <td className="font-bold text-purple">
                      Safety
                    </td>
                    <td className="flex flex-col gap-4">
                      <tr className="flex gap-[5px] items-center">
                        <ToggleSwitch
                          isToggled={controller.permissions.REENTRANCY}
                          onToggle={() => updatePermission(controller.address, 'REENTRANCY')} 
                          controllerAddress={controller.address}
                          permissionKey="REENTRANCY"
                        />
                        <span>Reentrancy</span>
                      </tr>
                    </td>
                  </tr>
                </tr>
              )}
            </tbody>
          ))}
        </div>
      </div>
  );
};

export default Keymanager