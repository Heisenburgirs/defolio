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

interface VaultObject {
  contract: string;
  name: string;
  desc: string;
  tokenBalances: TokenBalances;
}

const Vault = () => {
  const { address, isConnected } = useAccount()
  const { vaults } = useVault()
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingData, setIsSettingData] = useState(false);

  const [addVault, setAddVault] = useState(false)
  const [hover, setHover] = useState(false);

  const [hasProvidedName, setHasProvidedName] = useState(false);
  const [hasProvidedDesc, setHasProvidedDesc] = useState(false);
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

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

  const test1 = async() => {
    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();
    const vaultURDFactory = new ethers.ContractFactory(
      LSP1UniversalReceiverDelegateVault.abi,
      LSP1UniversalReceiverDelegateVault.bytecode,
    );

    const URD = await vaultURDFactory.connect(signer).deploy();

    const contractAddress = await URD.deployTransaction.wait();
    
    console.log(contractAddress)
  }

  return (
    <div className="flex w-full h-full bg-white shadow rounded-15">
      <div className="flex flex-col py-8 px-6 w-full h-full gap-12">
        {isManage ? (
          <>
            <title>Edit Vault</title>
            <div
              className="flex gap-2 px-4 items-center text-lightPurple hover:text-purple hover:cursor-pointer transition text-small"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onClick={() => {setIsManage(false)}}
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
            <div className="flex w-full h-full flex-col gap-8 px-4">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="text-purple font-bold text-large">{selectedVault?.name}</div>
                  <div className="text-purple">{selectedVault?.desc}</div>
                </div>
                <div className="flex gap-2 items-center hover:cursor-pointer opacity-75" onClick={() => {copyToClipboard(selectedVault?.contract); notify("Vault Address Copied", NotificationType.Success)}}>
                  <div className="text-purple">{formatAddress(selectedVault?.contract || "")}</div>
                  <Image src={copy} width={12} height={12} alt="Copy vault address" />
                </div>
              </div>
              <div className="flex sm:flex-col keymanager:flex-row sm:gap-4 keymanager:gap-0 w-full justify-between">
                <TokenType tokenType={tokenType} setTokenType={setTokenType}/>
                <SearchBar placeholder="Search for a token..." onSearch={value => setSearchQuery(value)} />
              </div>

              <div className="flex flex-col w-full gap-2">
                <div className="border-b border-lightPurple border-opacity-10 pb-2 hidden sm:table-header-group grid grid-cols-12">
                  <div className="flex w-full justify-between">
                    <div className="sm:col-span-2 text-purple font-normal opacity-75 flex">
                      Token
                    </div>
                    <div className="flex w-full justify-end text-purple font-normal opacity-75 flex">
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
                        <div className="flex w-full justify-between items-center">
                          <div className="flex items-center gap-4 text-purple font-normal opacity-75">
                            <div className="flex flex-col">
                              <div className="text-small font-bold">{token.Name}</div>
                              <div className="text-xsmall opacity-75">{token.Symbol}</div>
                            </div>
                          </div>
                          <div onClick={() => handleDropdownClick(index)} className="relative flex flex-col gap-2 pr-2 w-full items-end justify-end hover:cursor-pointer">
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
            </div>
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