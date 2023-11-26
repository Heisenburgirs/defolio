import { ethers } from "ethers";
import { useAccount } from "wagmi";
import SessionKeysContract from '../../contracts/SessionAbi.json';
import { SessionKeys } from '../schema/SessionKeys'
import ERC725 from "@erc725/erc725.js";
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import { useSessionKeys } from "@/GlobalContext/SessionContext/SessionContext";
import { useEffect, useState } from "react";
import Image from 'next/image'
import loading from '@/public/loading.gif'

const Session = () => {
  const { address } = useAccount()
  const { setIndexKey, sessionAddress, sessionedAddresses, isLoading } = useSessionKeys()

  const [hasDeployedSession, setHasDeployedSession] = useState(false);

  const [isDeploying, setIsDeploying] = useState(true);
  const [isSettingData, setIsSettingData] = useState(false);
  const [isSessionSetup, setIsSessionSetup] = useState(false);

  useEffect(() => {
    if (sessionAddress) {
      setHasDeployedSession(true)
    }
  }, [sessionAddress])

  const deploy = async () => {
    setIsDeploying(true)
    const provider = new ethers.providers.Web3Provider(window.lukso);
    
    const signer = provider.getSigner();
    const ContractFactory = new ethers.ContractFactory(SessionKeysContract.abi, SessionKeysContract.bytecode, signer);
    const myUniversalProfile = new ethers.Contract(address || '', UniversalProfile.abi, signer);

    try {
      // Deploy session contract
      const contract = await ContractFactory.deploy();
      const awaitVault = await contract.deployTransaction.wait();
      const sessionAddress = awaitVault.contractAddress

      console.log("Contract deployed to address:", sessionAddress);

      try {
        const erc725 = new ERC725(
          SessionKeys,
          address,
          'https://rpc.testnet.lukso.network'
        );

        const existingData = await erc725.fetchData(`SessionKeys[]`);

        let existingSessionKeysArray: string[];

          // Check if existingVaults is an array and handle accordingly
          if (Array.isArray(existingData.value)) {
            existingSessionKeysArray = existingData.value;
          } else if (typeof existingData.value === 'string') {
            // If it's a string, make it an array with that string as the only element
            existingSessionKeysArray = [existingData.value];
          } else {
            // If it's neither (or the data doesn't exist), start with an empty array
            existingSessionKeysArray = [];
          }

          // Now existingVaultsArray is definitely an array, so we can spread it
          const updatedSessionKeys = [...existingSessionKeysArray, sessionAddress];

          const data = erc725.encodeData([
            {
              keyName: 'SessionKeys[]',
              value: [sessionAddress],
            }
          ]);

          const setData = await myUniversalProfile.setDataBatch(data.keys, data.values);

          const txResult = await setData.wait()

          const sessionKeysAddresses = await erc725.getData('SessionKeys[]');
          console.log("sessionKeysAddresses", sessionKeysAddresses);
      } catch (error) {
        console.error("Error setting data", error);
      }

    } catch (error) {
        console.error("Error deploying contract:", error);
    }
  }

  const grantSession = async () => {
    const provider = new ethers.providers.Web3Provider(window.lukso);
    
    const signer = provider.getSigner();

    const contractInstace = new ethers.Contract("0xdAB89b82973a71d75d4630Ee2217BC984DB05830", SessionKeysContract.abi, signer)
    const durationInSeconds = 60;
    const session = contractInstace.grantSession("0xD424FA141a6B75AA8F64be6c924aA2b314B927B3", durationInSeconds)
  }

  const executeSessionTransfer = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.lukso);
      
      const signer = provider.getSigner();
      const myUniversalProfile = new ethers.Contract(address || '', UniversalProfile.abi, signer);
  
      const sessionContract = new ethers.Contract("0xB125c35859ae4fBe4ce96445565FE70D03dF4602", SessionKeysContract.abi, signer);

      const sendAmount = "0.0001"
  
      // Convert the amount from LYX to Wei
      const amountInWei = ethers.utils.parseEther(sendAmount.toString());
  
      // Prepare the parameters for the execute function
      const recipientAddress = "0x368731AE2E23e72751C432A935A2CF686Bb72AAC";
  
      // Execute the transfer
      //const transaction = await sessionContract.execute(0, "0xfB8a1f71669B1171dbc50fac869f02223EcfEA8F", 0, sessionCallData);
      /*const tx = await sessionContract.execute({
        address,
        recipientAddress,
        ethers.utils.parseEther(sendAmount)
      });*/
  
      console.log('LYX transfer executed successfully');
    } catch (error) {
      console.error('Error executing session transfer:', error);
    }
  };
  

  return (
    <div className="flex w-full h-full bg-white shadow rounded-15 py-8 px-6">
      {isLoading ? (
        <div className="loading opacity-75 w-full flex justify-center p-16">
          <span className="loading__dot"></span>
          <span className="loading__dot"></span>
          <span className="loading__dot"></span>
        </div>
      )
      :
      (
        hasDeployedSession ? (
          <div className="flex flex-col w-full gap-6">
            <div className="flex w-full justify-between items-center">
              <div className="flex flex-col gap-[2px]">
                <div className="text-medium font-bold text-purple">Session Keys</div>
                <div className="text-lightPurple">Manage 3rd party sessions</div>
              </div>
              <div className="flex py-2 px-4 text-lightPurple border border-lightPurple rounded-15 hover:cursor-pointer hover:bg-lightPurple hover:text-white transition">
                Add Session
              </div>
            </div>
            <div>

            </div>
              <div className="flex bg-black rounded-15 py-2 px-4 hover:cursor-pointer text-white" onClick={deploy}>Deploy</div>
              <div className="flex bg-black rounded-15 py-2 px-4 hover:cursor-pointer text-white" onClick={grantSession}>Grant permission</div>
              <div className="flex bg-black rounded-15 py-2 px-4 hover:cursor-pointer text-white" onClick={executeSessionTransfer}>EXECUTE</div>

          </div>
        )
        :
        (
          isDeploying ?
          (
            isSettingData ? (
              isSessionSetup ? (
                  <div className="flex flex-col w-full h-full items-center justify-center gap-8">
                      <div className="flex flex-col items-center gap-4">
                          <div className="success-animation"></div>
                          <div className="text-medium text-purple font-bold">All Done!</div>
                      </div>
                      <button className="bg-lightPurple rounded-15 py-3 px-16 text-white" onClick={() => {setHasDeployedSession(true)}}>Continue</button>
                  </div>
              ) : (
                <div className="flex flex-col w-full h-full items-center justify-center">
                  <div className="flex flex-col w-full justify-center items-center">
                    <div className="loading opacity-75 w-full flex justify-center p-16">
                      <span className="loading__dot"></span>
                      <span className="loading__dot"></span>
                      <span className="loading__dot"></span>
                    </div>
                  </div>
                  <div className="text-medium text-purple font-bold">Setting Data on UP</div>
                </div>
              )
            ) : (
              <div className="flex flex-col w-full h-full items-center justify-center">
                <div className="flex flex-col w-full justify-center items-center">
                  <div className="loading opacity-75 w-full flex justify-center p-16">
                    <span className="loading__dot"></span>
                    <span className="loading__dot"></span>
                    <span className="loading__dot"></span>
                  </div>
                </div>
                <div className="text-medium text-purple font-bold">Deploying Session Manager</div>
              </div>
            )
          )
          :
          (
            <div className="flex flex-col px-12 gap-8">
              <div className="flex flex-col gap-2">
                <div className="text-large font-bold text-purple">Session Keys</div>
                <div className="text-lightPurple">Session keys in Web3 enhance security by allowing limited transaction permissions without exposing main private keys, reducing the risk of key compromise in the decentralized ecosystem.</div>
              </div>
  
              <div className="flex flex-col gap-6 items-start">
                <div className="text-lightPurple font-bold">
                  Session keys in Web3 can be effectively used in various sectors:
                </div>
                <ul className="flex flex-col gap-2 text-lightPurple">
                  <li>
                    <span className="font-bold">Gaming:</span> Secure asset management.
                  </li>
                  <li>
                    <span className="font-bold">DeFi:</span> Safe transaction delegation.
                  </li>
                  <li>
                    <span className="font-bold">NFT Marketplaces:</span> Controlled marketplace interaction.
                  </li>
                  <li>
                    <span className="font-bold">DAOs:</span> Governance participation security.
                  </li>
                </ul>
  
                <button disabled={isDeploying} className={`flex text-lightPurple border border-lightPurple rounded-15 hover:cursor-pointer hover:bg-lightPurple hover:text-white py-2 px-6 transition ${isDeploying && "bg-lightPurple text-white opacity-60 hover:cursor-not-allowed"}`}
                  onClick={deploy}
                >
                  Deploy Session Manager
                </button>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
};

export default Session;