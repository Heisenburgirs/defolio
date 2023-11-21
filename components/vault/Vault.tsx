import { ethers } from "ethers";
import { useAccount } from "wagmi";
import LSP9Vault from '@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json';
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import { VaultSchema } from '../schema/DeployedVaults'
import { VaultName } from '../schema/VaultName'
import { VaultDescription } from '../schema/VaultDescription'
import { useEffect, useState } from "react";
import Image from 'next/image'
import lightPurpleArrow from '@/public/icons/lightPurple_arrow.png';
import purpleArrow from '@/public/icons/purple_arrow.png';
import TransactionModal from "../modal/TransactionModal";
import { NotificationType, notify } from "../toast/Toast";

const Vault = () => {
  const { address, isConnected } = useAccount()

  const [addVault, setAddVault] = useState(false)
  const [hover, setHover] = useState(false);

  const [hasProvidedName, setHasProvidedName] = useState(false);
  const [hasProvidedDesc, setHasProvidedDesc] = useState(false);
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  const [isDeployingVault, setIsDeployingVault] = useState(false);
  const [transactionStep, setTransactionStep] = useState(1);

  useEffect(() => {
    setHasProvidedName(!!name);
    setHasProvidedDesc(!!desc);
  }, [name, desc]);

  const getData = async () => {
    const myErc725Contract = new ERC725(VaultSchema, address, "https://rpc.testnet.lukso.network");

    const fetch = await myErc725Contract.fetchData(`VaultsDeployed[]`)

    console.log("DATA FETCHED", fetch)

    const myErc725Contract2 = new ERC725(VaultName, address, "https://rpc.testnet.lukso.network");

    const fetch2 = await myErc725Contract2.fetchData({keyName: "VaultName:<address>", dynamicKeyParts: "0x4899eC2046B60C4Dd29eB5B148A97AA47d93e210"})

    console.log("DATA FETCHED", fetch2)

    const myErc725Contract3 = new ERC725(VaultDescription, address, "https://rpc.testnet.lukso.network");

    const fetch3 = await myErc725Contract3.fetchData({keyName: "VaultDescription:<address>", dynamicKeyParts: "0x4899eC2046B60C4Dd29eB5B148A97AA47d93e210"})

    console.log("DATA FETCHED", fetch3)
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

    try {
      const deployVault = await vaultFactory.connect(signer).deploy(address);
      setTransactionStep(2);

      console.log("Vault deployed: ", deployVault.address)
      
      try {
        setTransactionStep(1)
        const targetVaultAddress = deployVault.address;

        const data = erc725.encodeData([
          {
            keyName: 'VaultsDeployed[]',
            value: [targetVaultAddress],
          }
        ]);

        const data2 = erc7255.encodeData([
          {
            keyName: "VaultName:<address>",
            dynamicKeyParts: targetVaultAddress,
            value: name,
          }
        ]);

        const data3 = erc72555.encodeData([
          {
            keyName: "VaultDescription:<address>",
            dynamicKeyParts: targetVaultAddress,
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

  const test = async() => {
    console.log(name)
    console.log(desc)
  }

  return (
    <div className="flex w-full h-full bg-white shadow rounded-15">
      <div className="flex flex-col py-8 px-6 w-full h-full gap-12">
        {addVault ? (
          isDeployingVault ? (
            <TransactionModal
              successMsg='Vault Successfully Created'
              onBackButtonClick={() => {setIsDeployingVault(false); setTransactionStep(1); setAddVault(false)}} 
              transactionStep={transactionStep}
              setTransactionStep={setTransactionStep}
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
                    `py-2 px-6 bg-lightPurple bg-opacity-75 text-medium rounded-15 text-white transition
                    ${hasProvidedName && hasProvidedDesc ? 'bg-purple bg-opacity-100' : 'cursor-not-allowed opacity-50'}`
                  }
                  onClick={deployVault}
                  disabled={!hasProvidedName || !hasProvidedDesc}
                >
                  Finalize Vault
                </button>
                <div onClick={getData}>test</div>
              </div>
            </>

          )
        )
        :
        (
          <>
            <div className="flex w-full justify-between">
              <h1 className="text-medium text-purple font-bold">Your Vaults</h1>
              <div onClick={() => { if (isConnected) setAddVault(true) }} className="w-[135px] py-2 px-4 rounded-15 text-xsmall border border-lightPurple text-purple font-bold hover:cursor-pointer hover:bg-purple hover:text-white transition">
                Create a Vault
              </div>
            </div>
            <div className="flex w-full h-full">
              <div className="w-[250px] h-[250px] border border-lightPurple rounded-15 py-6 px-4 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="text-medium text-purple font-bold">Vault Name</div>
                  <div className="text-purple text-xsmall font-bold opacity-75">0x012...15fd</div>
                </div>
                <div className="w-full text-center py-2 rounded-15 border border-lightPurple text-purple hover:cursor-pointer hover:bg-lightPurple hover:text-white transition">Manage</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};  

export default Vault;