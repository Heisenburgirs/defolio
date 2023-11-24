import { ethers } from "ethers";
import { useAccount } from "wagmi";
import LSP9Vault from '@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json';
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { VaultSchema } from '../schema/DeployedVaults'
import { VaultName } from '../schema/VaultName'
import { VaultDescription } from '../schema/VaultDescription'
import { useEffect, useRef, useState } from "react";
import Image from 'next/image'
import lightPurpleArrow from '@/public/icons/lightPurple_arrow.png';
import purpleArrow from '@/public/icons/purple_arrow.png';
import TransactionModal from "../modal/TransactionModal";
import { NotificationType, notify } from "../toast/Toast";
import { useVault } from "@/GlobalContext/VaultContext/VaultContext";
import { formatAddress } from "@/app/utils/useFormatAddress";
import TokenType from '../tokentype/TokenType';
import SearchBar from "../searchbar/SearchBar";
import copy from '@/public/icons/copy.svg';
import externalLink from '@/public/icons/externalLink.svg';
import { copyToClipboard } from "@/app/utils/useCopyToCliptboard";
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json' assert { type: 'json' };
import LSP1UniversalReceiverDelegateVault from '@lukso/lsp-smart-contracts/artifacts/LSP1UniversalReceiverDelegateVault.json';
import { ERC725YDataKeys, PERMISSIONS } from '@lukso/lsp-smart-contracts/constants.js';
import { PopupButton } from "../popupButton/PopupButton";
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import { ToggleSwitch } from "../toggle/Toggle";
import { useKeymanager } from "@/GlobalContext/KeymanagerContext/KeymanagerContext";
import { isValidEthereumAddress } from "@/app/utils/useIsValidEthereumAddress";

interface VaultObject {
  contract: string;
  name: string;
  desc: string;
  tokenBalances: TokenBalances;
  controllersPermissions: ControllerPermission[];
  changedPermissions: ControllerPermission[];
}

const Vault = () => {
  const { address, isConnected } = useAccount();
  const { vaults, setVaults } = useVault();
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingData, setIsSettingData] = useState(false);
  // Permissions for Vault
  const [isController, setIsController] = useState(false);
  const [addController, setAddController] = useState<boolean>(false);
  const [arePermissionsChanged, setArePermissionsChanged] = useState(false)
  const [isChangePermissionInitiated, setIsChangePermissionInitiated] = useState(false);
  const [controllerAddresses, setControllerAddresses] = useState<{ address: string, permissions: string[] }[]>([]);

  const { setIndex } = useKeymanager()

  // Add Controller to Vault
  const [isAdditionInitiated, setIsAdditionInitiated] = useState(false);
  const [hasProvidedAddress, setHasProvidedAddress] = useState<boolean>(false);
  const [inputAddress, setInputAddress] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // Dynamic render of permissions
  const menuItems: string[] = [
    "Add Controller",
    "Add Extensions",
    "Call",
    "Change Extensions",
    "Change Owner",
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
    "Transfer Value",
    "Add Universal Receiver Delegate",
    "Change Universal Receiver Delegate",
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

  const chunkSizeOptions = [[4, 4, 5, 5, 3, 2], [3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];

  const getChunkSizesForScreenSize = () => {
    if (window.innerWidth <= 500) {
      return chunkSizeOptions[2]
    } else if (window.innerWidth <= 768) {
      return chunkSizeOptions[1]
    } else if (window.innerWidth <= 2920) {
      return chunkSizeOptions[0]
    }

    return chunkSizeOptions[0]
  };

  const [chunkSizes, setChunkSizes] = useState(getChunkSizesForScreenSize());

  useEffect(() => {
    const handleResize = () => {
      setChunkSizes(getChunkSizesForScreenSize());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [window.innerWidth]);

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

  const [addVault, setAddVault] = useState(false)
  const [hover, setHover] = useState(false);

  const [hasProvidedName, setHasProvidedName] = useState(false);
  const [hasProvidedDesc, setHasProvidedDesc] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const [isDeployingVault, setIsDeployingVault] = useState(false);
  const [transactionStep, setTransactionStep] = useState(1);

  const [isManage, setIsManage] = useState(false);
  const [tokenType, setTokenType] = useState<string>("LSP7")
  const [isDropdownVisible, setIsDropdownVisible] = useState<number | null>(null);
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [selectedVault, setSelectedVault] = useState<VaultObject>();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLSP7Tokens = selectedVault?.tokenBalances.LSP7.filter(token => 
    token.Name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.Symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLSP8Tokens = selectedVault?.tokenBalances.LSP8.filter(token => 
    token.Name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.Symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const safeFilteredLSP7Tokens = filteredLSP7Tokens ?? [];
  const safeFilteredLSP8Tokens = filteredLSP8Tokens ?? [];
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleDropdownClick = (index: number) => {
    if (index === isDropdownVisible) {
        setIsDropdownVisible(null); // Close if the same index is clicked
    } else {
        setIsDropdownVisible(index); // Open if a different index is clicked
    }
  };

  useEffect(() => {
    setHasProvidedName(!!name);
    setHasProvidedDesc(!!desc);
  }, [name, desc]);

  const getData = async () => {
    console.log(vaults)
  }

  const deployVault = async () => {
    setIsDeployingVault(true)
    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();
    const myUniversalProfile = new ethers.Contract(address || '', UniversalProfile.abi, signer);

    const vaultFactory = new ethers.ContractFactory(
      LSP9Vault.abi,
      LSP9Vault.bytecode,
    );

    const erc725 = new ERC725(
      VaultSchema,
      address,
      'https://rpc.testnet.lukso.network'
    );

    const erc7255 = new ERC725(
      VaultName,
      address,
      'https://rpc.testnet.lukso.network'
    );

    const erc72555 = new ERC725(
      VaultDescription,
      address,
      'https://rpc.testnet.lukso.network'
    );

    const myErc725Contract = new ERC725(VaultSchema, address, "https://rpc.testnet.lukso.network");

    const vaultURDFactory = new ethers.ContractFactory(
      LSP1UniversalReceiverDelegateVault.abi,
      LSP1UniversalReceiverDelegateVault.bytecode,
    );

    try {
      const deployVault = await vaultFactory.connect(signer).deploy(address);

      // vault address
      const awaitVault = await deployVault.deployTransaction.wait();
      const vaultAddress = awaitVault.contractAddress
      console.log("Vault deployed: ", vaultAddress)

      try {
        setTransactionStep(2)
        const vaultURD = await vaultURDFactory.connect(signer).deploy();
        console.log("vaultURD", vaultURD)

        // URD address
        const awaitURD = await vaultURD.deployTransaction.wait();
        const URDaddress = awaitURD.contractAddress;
        console.log("URDaddress", URDaddress)

        // Deployed vault interface
        const vault = new ethers.Contract(vaultAddress, LSP9Vault.abi);

        // Encode
        const setDataCalldata = vault.interface.encodeFunctionData('setData', [
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
          URDaddress, 
        ]);
        console.log(setDataCalldata)

        const setURD = await myUniversalProfile.execute(
          0,
          vaultAddress,
          0,
          setDataCalldata,
        );

        console.log("setURD", setURD)

        try {
          setIsSettingData(true)

          const existingData = await myErc725Contract.fetchData(`VaultsDeployed[]`);

          let existingVaultsArray: string[];

          // Check if existingVaults is an array and handle accordingly
          if (Array.isArray(existingData.value)) {
            existingVaultsArray = existingData.value;
          } else if (typeof existingData.value === 'string') {
            // If it's a string, make it an array with that string as the only element
            existingVaultsArray = [existingData.value];
          } else {
            // If it's neither (or the data doesn't exist), start with an empty array
            existingVaultsArray = [];
          }

          // Now existingVaultsArray is definitely an array, so we can spread it
          const updatedVaults = [...existingVaultsArray, vaultAddress];

          const data = erc725.encodeData([
            {
              keyName: 'VaultsDeployed[]',
              value: updatedVaults,
            }
          ]);

          const data2 = erc7255.encodeData([
            {
              keyName: "VaultName:<address>",
              dynamicKeyParts: vaultAddress,
              value: name,
            }
          ]);

          const data3 = erc72555.encodeData([
            {
              keyName: "VaultDescription:<address>",
              dynamicKeyParts: vaultAddress,
              value: desc,
            }
          ]);

          // Assuming data, data2, and data3 are correctly encoded
          const allKeys = [...data.keys, ...data2.keys, ...data3.keys];
          const allValues = [...data.values, ...data2.values, ...data3.values];


          const setData = await myUniversalProfile.setDataBatch(allKeys, allValues);
          setTransactionStep(2)

          const txResult = await setData.wait()

          console.log("RESULTS ARE IN", txResult);
          setIndex(100)
          setTransactionStep(3)
        } catch (err) {
          // First, check if err is an object and has a 'code' property
          if (typeof err === 'object' && err !== null && 'code' in err) {
            // Now TypeScript knows err is an object and has a 'code' property
            const errorCode = (err as { code: unknown }).code;
            if (errorCode === 4001) {
              // Handle user's rejection
              console.log("User declined the transaction");
              notify("Signature Declined", NotificationType.Error);
              setIsDeployingVault(false)
            } else {
              // Handle other errors
              console.log("ERROR SETTING DATA", err);
              setIsDeployingVault(true)
              notify("Error Setting Data", NotificationType.Error);
              setTransactionStep(4);
            }
          } else {
            // Handle the case where err is not an object or doesn't have 'code'
            console.log("ERROR SETTING DATA", err);
          }
        }

      } catch (err) {
        // First, check if err is an object and has a 'code' property
        if (typeof err === 'object' && err !== null && 'code' in err) {
          // Now TypeScript knows err is an object and has a 'code' property
          const errorCode = (err as { code: unknown }).code;
          if (errorCode === 4001) {
            // Handle user's rejection
            console.log("User declined the transaction");
            notify("Signature Declined", NotificationType.Error);
            setIsDeployingVault(false)
          } else {
            // Handle other errors
            console.log("ERROR DEPLOYING URD", err);
            setIsDeployingVault(true)
            notify("Error Deploying URD", NotificationType.Error);
            setTransactionStep(4);
          }
        } else {
          // Handle the case where err is not an object or doesn't have 'code'
          console.log("ERROR DEPLOYING URD", err);
        }
      }
    } catch (err) {
      // First, check if err is an object and has a 'code' property
      if (typeof err === 'object' && err !== null && 'code' in err) {
        // Now TypeScript knows err is an object and has a 'code' property
        const errorCode = (err as { code: unknown }).code;
        if (errorCode === 4001) {
          // Handle user's rejection
          console.log("User declined the transaction");
          notify("Signature Declined", NotificationType.Error);
          setIsDeployingVault(false)
        } else {
          // Handle other errors
          console.log("ERROR DEPLOYING VAULT", err);
          setIsDeployingVault(true)
          notify("Error Deploying Vault", NotificationType.Error);
          setTransactionStep(4);
        }
      } else {
        // Handle the case where err is not an object or doesn't have 'code'
        console.log("ERROR DEPLOYING VAULT", err);
      }
    } 
  }

  useEffect(() => {
    if (controllerAddresses.length > 0) {
      setArePermissionsChanged(true);
    } else {
      setArePermissionsChanged(false);
    }
  }, [controllerAddresses])

  // Permissions for Vault
  const handleReset = () => {
    // Clear everything from changedPermissions
    setSelectedVault(prevSelectedVault => {
      if (!prevSelectedVault) {
        // If prevSelectedVault is undefined, just return it
        return prevSelectedVault;
      }
      // Update only if prevSelectedVault is defined
      return {
        ...prevSelectedVault,
        changedPermissions: [...prevSelectedVault.controllersPermissions] // Reset to controllersPermissions
      };
    });
    setControllerAddresses([])
  };

  // Existing Controller Permissions
  const handleConfirm = async () => {
    console.log(selectedVault?.changedPermissions)
    const erc725 = new ERC725(
      LSP6Schema as ERC725JSONSchema[],
      address,
      'https://rpc.testnet.lukso.network'
    );

    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();

    const myUniversalProfile = new ethers.Contract(address || '', UniversalProfile.abi, signer);

    const controllersWithChanges = selectedVault?.changedPermissions.filter(controller => controller.isChanged);

    console.log(controllersWithChanges)

    const encodedDataArray = controllersWithChanges?.map(controller => {
      // Encode the permissions for this controller
      const encodedPermissions = erc725.encodePermissions(controller.permissions);
    
      // Prepare the data for blockchain update
      const data = erc725.encodeData([
        {
          keyName: 'AddressPermissions:Permissions:<address>',
          dynamicKeyParts: controller.address,
          value: encodedPermissions,
        }
      ]);
    
      return {
        address: controller.address,
        encodedData: data
      };
    });

    const allKeys = encodedDataArray?.flatMap(item => item.encodedData.keys);
    const allValues = encodedDataArray?.flatMap(item => item.encodedData.values);

    try {
      const tx = await myUniversalProfile.setDataBatch(allKeys, allValues);
      setIsChangePermissionInitiated(true)
      setTransactionStep(2)

      const receipt = await tx.wait();
      setTransactionStep(3)
      setIndex(1)
      setArePermissionsChanged(false)
    } catch (err) {
      // First, check if err is an object and has a 'code' property
      if (typeof err === 'object' && err !== null && 'code' in err) {
        // Now TypeScript knows err is an object and has a 'code' property
        const errorCode = (err as { code: unknown }).code;
        if (errorCode === 4001) {
          // Handle user's rejection
          console.log("User declined the transaction");
          notify("Signature Declined", NotificationType.Error);
          setIsChangePermissionInitiated(false)
        } else {
          // Handle other errors
          console.log("ERROR SETTING CONTROLLER", err);
          setIsChangePermissionInitiated(true)
          notify("Error Setting Controller", NotificationType.Error);
          setTransactionStep(4);
        }
      } else {
        // Handle the case where err is not an object or doesn't have 'code'
        console.log("An unexpected error occurred", err);
        setTransactionStep(4);
      }
    }
  };

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

  const updatePermission = (controllerAddress: string, permissionKey: string) => {
    setArePermissionsChanged(true);

    setSelectedVault(prevSelectedVault => {
      if (!prevSelectedVault) {
        // If there is no selected vault, return the current state
        return prevSelectedVault;
      }
  
      // Map over the changedPermissions of the selected vault
      const updatedChangedPermissions = prevSelectedVault.changedPermissions.map(controller => {
        if (controller.address === controllerAddress) {
          // Update the permissions for the matching controller
          const updatedPermissions = {
            ...controller.permissions,
            [permissionKey]: !controller.permissions[permissionKey] // Toggle the specific permission
          };
  
          return { ...controller, permissions: updatedPermissions, isChanged: true };
        }
        return controller;
      });
  
      // Return the updated selected vault with the new changedPermissions
      return {
        ...prevSelectedVault,
        changedPermissions: updatedChangedPermissions
      };
    });

    setControllerAddresses(currentAddresses => {
      const addressIndex = currentAddresses.findIndex(c => c.address === controllerAddress);
    
      if (addressIndex > -1) {
        // Address exists, update permissions
        let updatedPermissions = [...currentAddresses[addressIndex].permissions];
        const permissionExists = updatedPermissions.includes(permissionKey);
        
        if (permissionExists) {
          // Remove the permission
          updatedPermissions = updatedPermissions.filter(key => key !== permissionKey);
        } else {
          // Add the permission
          updatedPermissions.push(permissionKey);
        }
    
        if (updatedPermissions.length === 0) {
          // If no permissions left, remove the address
          return [
            ...currentAddresses.slice(0, addressIndex),
            ...currentAddresses.slice(addressIndex + 1),
          ];
        } else {
          // Update the address with modified permissions
          const updatedAddress = { ...currentAddresses[addressIndex], permissions: updatedPermissions };
          return [
            ...currentAddresses.slice(0, addressIndex),
            updatedAddress,
            ...currentAddresses.slice(addressIndex + 1),
          ];
        }
      } else {
        // Address does not exist, create a new entry
        const newAddress = { address: controllerAddress, permissions: [permissionKey] };
        return [...currentAddresses, newAddress];
      }
    });
  };

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

  const addNewController = async () => {

    // Check if the input address is already a controller
    const isAlreadyController = selectedVault?.controllersPermissions.some(controller => controller.address === inputAddress);

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

    // Now encode the permissions using erc725.encodePermissions
    const beneficiaryPermissions = erc725.encodePermissions(permissionsObject);

    const addressPermissionsArray = await erc725.getData('AddressPermissions[]');
    const controllers = addressPermissionsArray.value;

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
      setIndex(2)

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
    <div className="flex w-full h-full bg-white shadow rounded-15">
      <div className="flex flex-col py-8 px-6 w-full h-full gap-12">
        {isManage ? (
          <>
            <title>Manage Vault</title>
            <div
              className="flex gap-2 px-4 items-center text-lightPurple hover:text-purple hover:cursor-pointer transition text-small"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onClick={() => {addController ? setAddController(false) : setIsManage(false)}}
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
            {addController ? (
              isAdditionInitiated ? (
                <TransactionModal
                  successMsg='Controller Successfuly Updated'
                  onBackButtonClick={() => {setAddController(false)}} 
                  transactionStep={transactionStep}
                  setTransactionStep={setTransactionStep}
                  message1='Waiting for Confirmation'
                  message2='Transaction Submitted'
                  message3='Transaction Successful'
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
                  <div className="flex flex-col py-6 sm:px-2 lg:px-16 gap-16 justify-center items-center">
                    <div className="flex flex-col gap-4 justify-center items-center">
                      <div className="text-purple font-bold text-medium">Add New Controller</div>
                      <div className="text-lightPurple text-medium text-center">Choose permissions you wish this controller to have on your Universal Profile</div>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter address..." 
                      className="px-4 py-2 sm:w-[200px] base:w-[350px] md:w-[500px] border border-lightPurple rounded-15 focus:outline-purple"
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
            <div className="flex w-full h-full flex-col gap-8 px-4">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div onClick={() => {console.log(selectedVault)}} className="text-purple font-bold text-large">{selectedVault?.name}</div>
                  <div className="text-purple">{selectedVault?.desc}</div>
                </div>
                <div className="flex gap-2 items-center hover:cursor-pointer opacity-75" onClick={() => {copyToClipboard(selectedVault?.contract); notify("Vault Address Copied", NotificationType.Success)}}>
                  <div className="text-purple">{formatAddress(selectedVault?.contract || "")}</div>
                  <Image src={copy} width={12} height={12} alt="Copy vault address" />
                </div>
              </div>
              {isController ? (
                <>
                  <div className="flex sm:gap-4 keymanager:gap-0 sm:flex-col keymanager:flex-row w-full keymanager:justify-between keymanager:items-center">
                    <div className="flex flex-col gap-2">
                      <div onClick={() => {console.log(selectedVault)}} className="text-medium font-bold text-purple">Controller Permissions</div>
                      <div className="sm:text-xsmall md:text-small text-purple opacity-90">Remove, add and manage controller permissions</div>
                    </div>
                    <div onClick={() => { if (isConnected) setAddController(true) }}  className="w-[135px] py-2 px-4 rounded-15 text-xsmall border border-lightPurple text-purple font-bold hover:cursor-pointer hover:bg-purple hover:text-white transition">
                      Add Controller
                    </div>
                  </div>
                  <PopupButton isVisible={arePermissionsChanged} onReset={handleReset} onConfirm={handleConfirm} controllerAddresses={controllerAddresses.map(controller => controller.address)}/>
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
                    selectedVault?.changedPermissions.map((controller, index) => (
                      <div key={index} className="hidden sm:table-header-group grid grid-cols-12 border border-lightPurple border-opacity-25 rounded-15 py-2 px-4">
                        <div  className="flex w-full justify-between items-center py-2">
                          <div className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal">
                            <div className="text-small font-bold">{formatAddress(controller.address)}</div>
                          </div>
                          <div className="sm:col-span-1 lg:col-span-4 text-purple font-normal flex">
                            <div onClick={() => {togglePermissionsDropdown(controller.address)}} className="font-bold text-xsmall transition hover:cursor-pointer">show more</div>
                          </div>
                        </div> 
                        {visibilityStates[controller.address] && (
                          <div 
                            className={`flex w-full ${dropdownVisible[controller.address] ? 'animate-reveal' : 'animate-conceal'} py-4 transition sm:gap-4 md:gap-2 grid :grid-cols-1 keymanager:grid-cols-2 xl:grid-cols-3 text-xsmall overflow-y-auto hide-scrollbar`}
                            style={{ animationFillMode: 'forwards' }}
                          >
                            <div className="flex flex-col gap-4 py-2">
                              <div className="font-bold text-[18px] text-purple">
                                Ownership
                              </div>
                              <div className="flex flex-col justify-between gap-8 h-full">
                                <div className="flex gap-[10px] items-center">
                                  <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                    <div className="flex w-full justify-between">
                                      <span className="font-bold opacity-90 text-purple text-xsmall">Change Owner</span>
                                      <ToggleSwitch 
                                        isToggled={controller.permissions.CHANGEOWNER}
                                        onToggle={() => updatePermission(controller.address, 'CHANGEOWNER')} 
                                        controllerAddress={controller.address}
                                        permissionKey="CHANGEOWNER"
                                      />
                                    </div>
                                    <span className="opacity-75 text-purple text-xxsmall">Enable the transfer of ownership rights to another address</span>
                                  </div>
                                </div>
                                <div className="flex gap-[10px] items-center">
                                  <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                    <div className="flex w-full justify-between">
                                      <span className="font-bold opacity-90 text-purple text-xsmall">Add Controller</span>
                                      <ToggleSwitch
                                        isToggled={controller.permissions.ADDCONTROLLER}
                                        onToggle={() => updatePermission(controller.address, 'ADDCONTROLLER')} 
                                        controllerAddress={controller.address}
                                        permissionKey="ADDCONTROLLER"
                                      />
                                    </div>
                                    <span className="opacity-75 text-purple text-xxsmall">Allow adding new controllers to manage the wallet</span>
                                  </div>
                                </div>
                                <div className="flex gap-[10px] items-center">
                                  <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                    <div className="flex w-full justify-between">
                                      <span className="font-bold opacity-90 text-purple text-xsmall">Edit Permissions</span>
                                      <ToggleSwitch
                                        isToggled={controller.permissions.EDITPERMISSIONS}
                                        onToggle={() => updatePermission(controller.address, 'EDITPERMISSIONS')} 
                                        controllerAddress={controller.address}
                                        permissionKey="EDITPERMISSIONS"
                                      />
                                    </div>
                                    <span className="opacity-75 text-purple text-xxsmall">Grant authority to modify the permissions of other controllers</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4 py-2">
                              <div className="font-bold text-[18px] text-purple">
                                Signature
                              </div>
                              <div className="flex flex-col keymanager:h-full keymanager:justify-between gap-4">
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Encrypt</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.ENCRYPT}
                                      onToggle={() => updatePermission(controller.address, 'ENCRYPT')} 
                                      controllerAddress={controller.address}
                                      permissionKey="ENCRYPT"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Allow encryption of messages using the wallet's keys</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Decrypt</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.DECRYPT}
                                      onToggle={() => updatePermission(controller.address, 'DECRYPT')} 
                                      controllerAddress={controller.address}
                                      permissionKey="DECRYPT"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Allow decryption of encrypted messages using the wallet's keys</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Sign</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.SIGN}
                                      onToggle={() => updatePermission(controller.address, 'SIGN')} 
                                      controllerAddress={controller.address}
                                      permissionKey="SIGN"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Enable the wallet to sign messages, proving identity/consent</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4 py-2">
                              <div className="font-bold text-[18px] text-purple">
                                Asset Management
                              </div>
                              <div className="flex flex-col gap-4">
                              <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                <div className="flex w-full justify-between">
                                  <span className="font-bold opacity-90 text-purple text-xsmall">Super Transfer Value</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.SUPER_TRANSFERVALUE}
                                      onToggle={() => updatePermission(controller.address, 'SUPER_TRANSFERVALUE')} 
                                      controllerAddress={controller.address}
                                      permissionKey="SUPER_TRANSFERVALUE"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Allow transfer of value or assets with elevated permissions</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Transfer Value</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.TRANSFERVALUE}
                                      onToggle={() => updatePermission(controller.address, 'TRANSFERVALUE')} 
                                      controllerAddress={controller.address}
                                      permissionKey="TRANSFERVALUE"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Enable the transfer of native tokens or assets from the wallet</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4 py-2">
                              <div className="font-bold text-[18px] text-purple">
                                Calls
                              </div>
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Super Call</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.SUPER_CALL}
                                      onToggle={() => updatePermission(controller.address, 'SUPER_CALL')} 
                                      controllerAddress={controller.address}
                                      permissionKey="SUPER_CALL"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Grant enhanced calling capabilities, potentially with elevated privileges</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Call</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.CALL}
                                      onToggle={() => updatePermission(controller.address, 'CALL')} 
                                      controllerAddress={controller.address}
                                      permissionKey="CALL"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Authorize interactions with other smart contracts, enabling changes to them</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Super Static Call</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.SUPER_STATICCALL}
                                      onToggle={() => updatePermission(controller.address, 'SUPER_STATICCALL')} 
                                      controllerAddress={controller.address}
                                      permissionKey="SUPER_STATICCALL"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Permit advanced read-only interactions with smart contracts</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Static Call</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.STATICCALL}
                                      onToggle={() => updatePermission(controller.address, 'STATICCALL')} 
                                      controllerAddress={controller.address}
                                      permissionKey="STATICCALL"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Allow interactions with smart contracts in a read-only mode</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Super Delegate Call</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.SUPER_DELEGATECALL}
                                      onToggle={() => updatePermission(controller.address, 'SUPER_DELEGATECALL')} 
                                      controllerAddress={controller.address}
                                      permissionKey="SUPER_DELEGATECALL"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Allow high-level delegate calls with more extensive authority</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Delegate Call</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.DELEGATECALL}
                                      onToggle={() => updatePermission(controller.address, 'DELEGATECALL')} 
                                      controllerAddress={controller.address}
                                      permissionKey="DELEGATECALL"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Permit running code from any smart contract inside the wallet's environment</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4 py-2 keymanager:mt-[-380px] extension:mt-[-365px] extension2:mt-[-350px] md:mt-[-325px] xl:mt-0">
                              <div className="font-bold text-[18px] text-purple">
                                Extensions
                              </div>
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Add Extensions</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.ADDEXTENSIONS}
                                      onToggle={() => updatePermission(controller.address, 'ADDEXTENSIONS')} 
                                      controllerAddress={controller.address}
                                      permissionKey="ADDEXTENSIONS"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Permit the addition of extensions to enhance wallet functionality</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Change Extensions</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.CHANGEEXTENSIONS}
                                      onToggle={() => updatePermission(controller.address, 'CHANGEEXTENSIONS')} 
                                      controllerAddress={controller.address}
                                      permissionKey="CHANGEEXTENSIONS"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Grant the ability to modify or replace existing wallet extensions</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Add URD</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.ADDUNIVERSALRECEIVERDELEGATE}
                                      onToggle={() => updatePermission(controller.address, 'ADDUNIVERSALRECEIVERDELEGATE')} 
                                      controllerAddress={controller.address}
                                      permissionKey="ADDUNIVERSALRECEIVERDELEGATE"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Allow addition of delegates for universal receiver functionality</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Change URD</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.CHANGEUNIVERSALRECEIVERDELEGATE}
                                      onToggle={() => updatePermission(controller.address, 'CHANGEUNIVERSALRECEIVERDELEGATE')} 
                                      controllerAddress={controller.address}
                                      permissionKey="CHANGEUNIVERSALRECEIVERDELEGATE"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Permit modifications to the delegates of the universal receiver</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4 py-2  md:mt-0">
                              <div className="font-bold text-[18px] text-purple">
                                Relay & Execution
                              </div>
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Execute Relay Call</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.EXECUTE_RELAY_CALL}
                                      onToggle={() => updatePermission(controller.address, 'EXECUTE_RELAY_CALL')} 
                                      controllerAddress={controller.address}
                                      permissionKey="EXECUTE_RELAY_CALL"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Enable execution of relay calls for advanced transaction handling</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4 py-2 keymanager:mt-[-100px] md:mt-[-50px] xl:mt-0">
                              <div className="font-bold text-[18px] text-purple">
                                Contract Management
                              </div>
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Deploy</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.DEPLOY}
                                      onToggle={() => updatePermission(controller.address, 'DEPLOY')} 
                                      controllerAddress={controller.address}
                                      permissionKey="DEPLOY"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Enable deploying new smart contracts from the wallet</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Super Set Data</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.SUPER_SETDATA}
                                      onToggle={() => updatePermission(controller.address, 'SUPER_SETDATA')} 
                                      controllerAddress={controller.address}
                                      permissionKey="SUPER_SETDATA"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Enable advanced data setting capabilities, possibly with wider scope</span>
                                </div>
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Set Data</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.SETDATA}
                                      onToggle={() => updatePermission(controller.address, 'SETDATA')} 
                                      controllerAddress={controller.address}
                                      permissionKey="SETDATA"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Permit modification or setting of data within the wallet or its associated contracts</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-4 py-2 base:grid-row-6">
                              <div className="font-bold text-[18px] text-purple">
                                Safety
                              </div>
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:w-full md:w-[300px] gap-4 gap-[10px]">
                                  <div className="flex w-full justify-between">
                                    <span className="font-bold opacity-90 text-purple text-xsmall">Re-entrancy</span>
                                    <ToggleSwitch
                                      isToggled={controller.permissions.REENTRANCY}
                                      onToggle={() => updatePermission(controller.address, 'REENTRANCY')} 
                                      controllerAddress={controller.address}
                                      permissionKey="REENTRANCY"
                                    />
                                  </div>
                                  <span className="opacity-75 text-purple text-xxsmall">Allow successive executions, possibly in the context of smart contracts</span>
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
              )
              :
              (
                <>
                  <div className="flex sm:flex-col md:flex-row sm:gap-4 md:gap-0 w-full justify-between">
                    <div className="flex gap-4 sm:flex-col base:flex-row">
                      <TokenType tokenType={tokenType} setTokenType={setTokenType}/>
                      <div className="keymanager:hidden text-center py-2 px-4 text-lightPurple border border-lightPurple hover:bg-lightPurple hover:text-white transition hover:cursor-pointer rounded-15">Controllers</div>
                    </div>
                    <div className="flex gap-4 sm:flex-col base:flex-row">
                      <button onClick={() => {setIsController(true)}} className="sm:hidden keymanager:flex text-center py-2 px-4 text-lightPurple border border-lightPurple hover:bg-lightPurple hover:text-white transition hover:cursor-pointer rounded-15">Controllers</button>
                      <SearchBar placeholder="Search for a token..." onSearch={value => setSearchQuery(value)} />
                    </div>
                  </div>

                  <div className="flex flex-col w-full gap-2">
                    <div className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12">
                      <div className="grid sm:grid-cols-4 lg:grid-cols-12">
                        <div className="sm:col-span-2 base:col-span-1 lg:col-span-4 text-purple font-normal opacity-75 flex">
                          Token
                        </div>
                        <div className="sm:hidden base:justify-end md:justify-center lg:justify-start base:flex sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75">
                          Price
                        </div>
                        <div className="base:justify-end lg:justify-start sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75 flex">
                          Balance
                        </div>
                        <div className="sm:col-span-1 lg:col-span-1"></div>
                      </div>
                    </div>

                    {!isConnected ? (
                      <div className="flex items-center justify-center py-8 text-lightPurple text-small">Connect to see assets</div>
                    )
                    :
                    (
                      isLoading ? (
                        <div className="loading opacity-75 w-full flex justify-center items-center p-16">
                          <span className="loading__dot"></span>
                          <span className="loading__dot"></span>
                          <span className="loading__dot"></span>
                        </div>
                      )
                      :
                      (
                        (tokenType === "LSP7" ? safeFilteredLSP7Tokens : safeFilteredLSP8Tokens).map((token, index) => (
                          <div key={index} className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12 py-2">
                            <div className="grid sm:grid-cols-4 lg:grid-cols-12 items-center">
                              <div className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-4 text-purple font-normal opacity-75">
                                <div className="flex flex-col">
                                  <div className="text-small font-bold">{token.Name}</div>
                                  <div className="text-xsmall opacity-75">{token.Symbol}</div>
                                </div>
                              </div>
                              <div className="base:justify-end md:justify-center lg:justify-start sm:hidden base:flex sm:col-span-1 lg:col-span-4 text-purple font-normal opacity-75 flex">
                                <div className="font-bold">
                                  ...
                                </div>
                              </div>
                              <div className="flex flex-col base:items-end lg:items-start sm:col-span-1 lg:col-span-3 text-purple font-normal opacity-75">
                                <div className="font-bold">{balanceVisible ? (parseFloat(token.TokenAmount) % 1 === 0 ? parseInt(token.TokenAmount, 10) : parseFloat(token.TokenAmount).toFixed(2)) : "***"}</div>
                              </div>
                              <div onClick={() => handleDropdownClick(index)} className="relative flex flex-col gap-2 sm:col-span-1 lg:col-span-1 pr-2 w-full items-end justify-end hover:cursor-pointer">
                                <div className="w-[3px] h-[3px] rounded-[99px] bg-lightPurple bg-opacity-75"></div>
                                <div className="w-[3px] h-[3px] rounded-[99px] bg-lightPurple bg-opacity-75"></div>
                                <div className="w-[3px] h-[3px] rounded-[99px] bg-lightPurple bg-opacity-75"></div>
                                {index === isDropdownVisible && <div ref={dropdownRef} className={`absolute top-0 w-[220px] flex flex-col gap-4 py-4 z-50 justify-center items-center bg-white shadow rounded-10 py-2 px-4 border border-lightPurple border-opacity-25 mr-[-10px] mt-[35px]  ${isDropdownVisible === index ? 'animate-popup-in' : 'animate-popup-out'}`}
                                  style={{ animationFillMode: 'forwards' }}
                                >
                                  <div className="flex gap-4 justify-center items-center">
                                    <Image src={copy} width={18} height={18} alt="Copy Token Address" className="ml-[-20px]" />
                                    <button onClick={() => {copyToClipboard(token.Address), handleDropdownClick(index); notify("Address Copied", NotificationType.Success)}} className="text-xsmall text-lightPurple">Copy token address</button>
                                  </div>
                                  <div className="flex gap-4 justify-center items-center">
                                    <Image src={externalLink} width={18} height={18} alt="Copy Token Address" />
                                    <a href={`https://explorer.execution.testnet.lukso.network/address/${token.Address}`} target="_blank" onClick={() => {handleDropdownClick(index)}} className="text-xsmall text-lightPurple">View on block explorer</a>
                                  </div>
                                </div>
                                }
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </>
              )}
            </div>
            )}
            
          </>
        )
        :
        (
          addVault ? (
            isDeployingVault ? (
              <TransactionModal
                successMsg='Vault Successfully Created'
                onBackButtonClick={() => {setIsDeployingVault(false); setTransactionStep(1); setAddVault(false)}} 
                transactionStep={transactionStep}
                setTransactionStep={setTransactionStep}
                message1='Deploying Vault'
                message2={isSettingData ? "Setting Data" : "Deploying Universal Delegate"}
                message3='Transaction Successful'
              />
            )
            :
            (
              <>
                <title>New Vault</title>
                <div
                  className="flex gap-2 px-4 items-center text-lightPurple hover:text-purple hover:cursor-pointer transition text-small"
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  onClick={() => {setAddVault(false)}}
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
                <div className="flex flex-col w-full h-full items-center py-8 gap-16">
                  <h1 className="text-medium font-bold text-purple">Deploy New Vault</h1>
                  <div className="flex flex-col gap-6 w-[400px]">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lightPurple">Name</h2>
                      <input type="text" className="rounded-15 border border-lightPurple focus:outline-purple py-2 px-6 text-purple font-bold" placeholder="Enter vault name..."
                      onChange={(e) => { setName(e.target.value)}}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lightPurple">Description</h2>
                      <textarea className="h-[350px] rounded-15 border border-lightPurple focus:outline-purple py-2 px-6 text-purple font-bold" placeholder="Enter vault description..."
                        onChange={(e) => { setDesc(e.target.value)}}
                      />
                    </div>
                  </div>
                  <button 
                    className={
                      `py-2 px-12 bg-lightPurple bg-opacity-75 text-medium rounded-15 text-white transition
                      ${hasProvidedName && hasProvidedDesc ? 'bg-purple bg-opacity-100' : 'cursor-not-allowed opacity-50'}`
                    }
                    onClick={deployVault}
                    disabled={!hasProvidedName || !hasProvidedDesc}
                  >
                    Finalize Vault
                  </button>
                </div>
              </>
            )
          )
          :
          (
            <>
              <title>Vaults</title>
              <div className="flex w-full justify-between">
                <h1 className="text-medium text-purple font-bold">Your Vaults</h1>
                <div onClick={() => { if (isConnected) setAddVault(true) }} className="w-[135px] py-2 px-4 rounded-15 text-xsmall border border-lightPurple text-purple font-bold hover:cursor-pointer hover:bg-purple hover:text-white transition">
                  Create a Vault
                </div>
              </div>
              <div className="flex w-full h-full grid grid-cols-4 gap-32">
                {vaults.map((vault, index) => (
                  <div key={index} className="w-[250px] h-[250px] border border-lightPurple rounded-15 py-6 px-4 flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="text-medium text-purple font-bold">{vault.name}</div>
                      <div className="flex items-center gap-2 hover:cursor-pointer" onClick={() => {copyToClipboard(vault.contract); notify("Vault Copied!", NotificationType.Success)}}>
                        <div className="text-purple text-xsmall font-bold opacity-75">{formatAddress(vault.contract)}</div>
                        <Image src={copy} width={12} height={12} alt="Copy vault address" />
                      </div>
                      <div className="text-purple text-xsmall font-bold opacity-75">{vault.desc}</div>
                    </div>
                    <div 
                      onClick={() => {
                        setIsManage(true);
                        setSelectedVault(vault);
                      }}
                      className="w-full text-center py-2 rounded-15 border border-lightPurple text-purple hover:cursor-pointer hover:bg-lightPurple hover:text-white transition">Manage</div>
                  </div>
                ))}
                
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};  

export default Vault;