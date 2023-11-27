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
import { NotificationType, notify } from "../toast/Toast";
import { isValidEthereumAddress } from "@/app/utils/useIsValidEthereumAddress";
import lightPurpleArrow from '@/public/icons/lightPurple_arrow.png';
import purpleArrow from '@/public/icons/purple_arrow.png';
import { formatAddress } from "@/app/utils/useFormatAddress";

interface VisibilityStates {
  [key: string]: boolean;
}

const Session = () => {
  const { address } = useAccount()
  const { setIndexKey, sessionAddress, sessionedAddresses, isLoading } = useSessionKeys()

  const activeSessions = sessionedAddresses?.filter(session => !session.isExpired);
  const expiredSessions = sessionedAddresses?.filter(session => session.isExpired);

  const [hasDeployedSession, setHasDeployedSession] = useState(false);
  const [sessionType, setSessionType] = useState('Active');

  const [isDeploying, setIsDeploying] = useState(true);
  const [isSettingData, setIsSettingData] = useState(false);
  const [isSessionSetup, setIsSessionSetup] = useState(false);
  const [isGrantingSession, setIsGrantingSession] = useState(false);
  const [grantTransactionInit, setGrantTransactionInit] = useState(false);
  const [grantSessionSuccess, setGrantSessionSuccess] = useState(false);

  const [grantSessionAddress, setGrantSessionAddress] = useState('');
  const [hasProvidedAddress, setHasProvidedAddress] = useState<boolean>(false);
  const [hasProvidedTime, setHasProvidedTime] = useState<boolean>(false);
  const [sessionTime, setSessionTime] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hover, setHover] = useState(false);

  const [updatedSession, setUpdatedSession] = useState('');
  const [hasProvidedUpdatedTime, setHasProvidedUpdatedTime] = useState<boolean>(false);
  const [updatedSessionAddress, setUpdatedSessionAddress] = useState('');
  const [isUpdatingSession, setIsUpdatingSession] = useState(false)
  const [isTerminatingSession, setIsTerminatingSession] = useState(false)

  type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';
  const [selectedOption, setSelectedOption] = useState<TimeUnit>('hours');

  const timeUnitMultipliers: Record<TimeUnit, number> = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400
  };

  const options = ['seconds', 'minutes', 'hours', 'days'];
  
  const toggleDropdown = () => setIsOpen(!isOpen);

  //@ts-ignore
  const handleOptionClick = (option) => {
      setSelectedOption(option);
      setIsOpen(false);
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
        }, 200); // 500ms matches the duration of the 'conceal' animation
    } else {
        // Open dropdown immediately and start opening animation
        setVisibilityStates(prevStates => ({
            ...prevStates,
            [controllerAddress]: true
        }));
        setDropdownVisible(prev => ({ ...prev, [controllerAddress]: true }));
    }
  };

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
        setIsSettingData(true)
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

          setIsSessionSetup(true)
          setIndexKey(10)
      } catch (err) {
        // First, check if err is an object and has a 'code' property
        if (typeof err === 'object' && err !== null && 'code' in err) {
          // Now TypeScript knows err is an object and has a 'code' property
          const errorCode = (err as { code: unknown }).code;
          if (errorCode === 4001) {
            // Handle user's rejection
            console.log("User declined the transaction");
            notify("Signature Declined", NotificationType.Error);
          } else {
            // Handle other errors
            console.log("ERROR SETTING DATA ON UP", err);
            notify("Error Setting Data", NotificationType.Error);
          }
        } else {
          // Handle the case where err is not an object or doesn't have 'code'
          console.log("An unexpected error occurred", err);
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
        } else {
          // Handle other errors
          console.log("ERROR DEPLOYING SESSION MANAGER", err);
          notify("Error Deploying Session Manager", NotificationType.Error);
        }
      } else {
        // Handle the case where err is not an object or doesn't have 'code'
        console.log("An unexpected error occurred", err);
      }
    }
  }

  const calculateSessionDuration = () => {
    const inputNumber = parseInt(sessionTime, 10);
    if (isNaN(inputNumber) || inputNumber <= 0) {
        return 0;
    }

    return inputNumber * timeUnitMultipliers[selectedOption];
  };

  const calculateUpdatedSessionDuration = () => {
    const inputNumber = parseInt(updatedSession, 10);
    if (isNaN(inputNumber) || inputNumber <= 0) {
        return 0;
    }

    return inputNumber * timeUnitMultipliers[selectedOption];
  };

  const grantSession = async () => {
    if (!sessionTime) {
      notify("Provide Session Time", NotificationType.Error);
    }

    setGrantTransactionInit(true)

    const provider = new ethers.providers.Web3Provider(window.lukso);
    
    const signer = provider.getSigner();

    if (sessionAddress) {
      try {
        const contractInstace = new ethers.Contract(sessionAddress[0], SessionKeysContract.abi, signer)
    
        const sessionDuration = calculateSessionDuration();
    
        console.log("grantSessionAddress", sessionAddress[0])
        console.log("sessionDuration", sessionDuration)
        const session = contractInstace.grantSession(grantSessionAddress, sessionDuration)

        setGrantSessionSuccess(true)
      } catch (err) {
        // First, check if err is an object and has a 'code' property
        if (typeof err === 'object' && err !== null && 'code' in err) {
          // Now TypeScript knows err is an object and has a 'code' property
          const errorCode = (err as { code: unknown }).code;
          if (errorCode === 4001) {
            // Handle user's rejection
            console.log("User declined the transaction");
            notify("Signature Declined", NotificationType.Error);
          } else {
            // Handle other errors
            console.log("ERROR GRANTING SESSION", err);
            notify("Error Granting Session", NotificationType.Error);
          }
        } else {
          // Handle the case where err is not an object or doesn't have 'code'
          console.log("An unexpected error occurred", err);
        }
      }
    }
  }

  const executeSessionTransfer = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.lukso);
      
      const signer = provider.getSigner();
      const myUniversalProfile = new ethers.Contract(address || '', UniversalProfile.abi, signer);
  
      const sessionContract = new ethers.Contract("0xdAB89b82973a71d75d4630Ee2217BC984DB05830", SessionKeysContract.abi, signer);
  
      const amount = "0.0001";
      const amountInWei = ethers.utils.parseEther(amount.toString());
  
      // Prepare the parameters for the execute function
      const recipientAddress = address;
  
      // Execute the transfer
      const tx = await sessionContract.execute("0", recipientAddress, amountInWei, "0x");
  
      notify("LYX Transferred Successfully", NotificationType.Success)
      console.log('LYX transfer executed successfully');

    } catch (error) {
      console.error('Error executing session transfer:', error);
    }
  };

  const updateSession = async () => {
    if (!updatedSession) {
      notify("Session Time Required", NotificationType.Error)
      return
    }

    setIsUpdatingSession(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.lukso);
      
      const signer = provider.getSigner();
      const myUniversalProfile = new ethers.Contract(address || '', UniversalProfile.abi, signer);

      if (sessionAddress) {
        try {
          const sessionContract = new ethers.Contract(sessionAddress[0], SessionKeysContract.abi, signer);
  
          const sessionDuration = calculateUpdatedSessionDuration();
  
          const update = await sessionContract.updateSessionDuration(updatedSessionAddress, sessionDuration)

          notify("Session Updated Successfully", NotificationType.Success)
          setIndexKey(5)
          setUpdatedSession('')
          setUpdatedSessionAddress('')
          setIsUpdatingSession(false)
        } catch (err) {
          // First, check if err is an object and has a 'code' property
          if (typeof err === 'object' && err !== null && 'code' in err) {
            // Now TypeScript knows err is an object and has a 'code' property
            const errorCode = (err as { code: unknown }).code;
            if (errorCode === 4001) {
              // Handle user's rejection
              console.log("User declined the transaction");
              notify("Signature Declined", NotificationType.Error);
            } else {
              // Handle other errors
              console.log("ERROR UPDATING SESSION", err);
              notify("Error Updating Session", NotificationType.Error);
            }
          }
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
        } else {
          // Handle other errors
          console.log("ERROR UPDATING SESSION", err);
          notify("Error Updating Session", NotificationType.Error);
        }
      } else {
        // Handle the case where err is not an object or doesn't have 'code'
        console.log("An unexpected error occurred", err);
      }
    }
  }
  
  const terminateSession = async (sessionToTerminate: string) => {
    setIsTerminatingSession(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.lukso);
      
      const signer = provider.getSigner();

      if (sessionAddress) {
        try {
          const sessionContract = new ethers.Contract(sessionAddress[0], SessionKeysContract.abi, signer);
  
          const update = await sessionContract.updateSessionDuration(sessionToTerminate, 0)

          notify("Session Terminated", NotificationType.Success)
          setIndexKey(5)
          setIsTerminatingSession(false)
        } catch (err) {
          // First, check if err is an object and has a 'code' property
          if (typeof err === 'object' && err !== null && 'code' in err) {
            // Now TypeScript knows err is an object and has a 'code' property
            const errorCode = (err as { code: unknown }).code;
            if (errorCode === 4001) {
              // Handle user's rejection
              console.log("User declined the transaction");
              notify("Signature Declined", NotificationType.Error);
            } else {
              // Handle other errors
              console.log("ERROR UPDATING SESSION", err);
              notify("Error Updating Session", NotificationType.Error);
            }
          }
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
        } else {
          // Handle other errors
          console.log("ERROR UPDATING SESSION", err);
          notify("Error Updating Session", NotificationType.Error);
        }
      } else {
        // Handle the case where err is not an object or doesn't have 'code'
        console.log("An unexpected error occurred", err);
      }
    }
  }

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
          isGrantingSession ? (
            grantTransactionInit ?(
              <div className="flex flex-col items-center justify-center w-full gap-6">
                {
                  grantSessionSuccess ? (
                    <div className="success-animation"></div>
                  )
                  :
                  (
                    <div className="loading opacity-75 w-full flex justify-center p-16">
                      <span className="loading__dot"></span>
                      <span className="loading__dot"></span>
                      <span className="loading__dot"></span>
                    </div>
                  )
                }
      
                <div className="font-bold text-purple text-medium">{grantSessionSuccess ? "Session Granted" : "Waiting for Confirmation"}</div>
                {grantSessionSuccess && <button className="bg-lightPurple rounded-15 py-3 px-16 text-white" onClick={() => {setIsGrantingSession(false); setGrantSessionSuccess(false); setGrantTransactionInit(false)}}>Back</button>}
              </div>
            )
            :
            (
              <div className="flex flex-col w-full h-full items-start px-8 gap-12">
                <div className="flex flex-col gap-6 items-start">
                  <div
                  className="flex gap-2 items-center text-lightPurple hover:text-purple hover:cursor-pointer transition text-small"
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  onClick={() => {setIsGrantingSession(false)}}
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
                  <h1 className="text-medium font-bold text-purple">Grant Session</h1>
                  <div className="flex flex-col gap-2">
                    <div className="text-lightPurple font-bold">Address</div>
                    <input 
                      type="text" 
                      placeholder="Enter address..." 
                      className="px-4 py-2 sm:w-[200px] base:w-[350px] md:w-[500px] border border-lightPurple rounded-15 focus:outline-purple"
                      onChange={(e) => { setGrantSessionAddress(e.target.value); setHasProvidedAddress(isValidEthereumAddress(e.target.value));}}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-lightPurple font-bold">Session</div>
                    <div className="flex gap-4">
                      <input 
                        type="number" 
                        placeholder="Session Time..." 
                        className="px-4 py-2 sm:w-[200px] base:w-[350px] md:w-[500px] border border-lightPurple rounded-15 focus:outline-purple"
                        onChange={(e) => { setSessionTime(e.target.value); setHasProvidedTime(isValidEthereumAddress(e.target.value));}}
                      />
                      <div className="relative w-48">
                        <div className="cursor-pointer p-2 border border-lightPurple rounded-15 px-6" onClick={toggleDropdown}>
                            {selectedOption}
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            </span>
                        </div>
  
                        {isOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-lightPurple rounded-15 px-2">
                                {options.map((option, index) => (
                                    <div 
                                        key={index} 
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleOptionClick(option)}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  className={
                    `py-2 px-6 bg-lightPurple bg-opacity-75 text-medium rounded-15 text-white transition
                    ${hasProvidedAddress ? 'bg-purple bg-opacity-100 hover:cursor-pointer' : 'cursor-not-allowed opacity-50'}`
                  }
                  onClick={grantSession}
                  disabled={!hasProvidedAddress && !hasProvidedTime}
                >
                  Finalize Session
                </button>
              </div>
            )
          )
          :
          (
            <div className="flex flex-col w-full gap-6">
              <div className="flex w-full justify-between items-center">
                <div className="flex flex-col gap-[2px]">
                  <div className="text-medium font-bold text-purple">Session Keys</div>
                  <div className="text-lightPurple">Manage 3rd party sessions</div>
                </div>
                <div onClick={() => {setIsGrantingSession(true)}} className="flex py-2 px-4 text-lightPurple border border-lightPurple rounded-15 hover:cursor-pointer hover:bg-lightPurple hover:text-white transition">
                  Grant Session
                </div>
              </div>
              <div>

              <div className="flex w-full justify-between items-center">
                <div className="flex w-[200px] gap-2 items-center md:justify-center border border-lightPurple rounded-20 p-[2px]">
                  <div 
                    onClick={() => setSessionType("Active")} 
                    className={`sm:w-1/2 text-center text-xsmall text-lightPurple rounded-20 px-4 py-2 hover:cursor-pointer ${sessionType === "Active" ? "bg-purple text-white" : "hover:bg-lightPurple hover:bg-opacity-50 hover:text-white"} transition`}
                  >
                    Active
                  </div>
                  <div 
                    onClick={() => setSessionType("Expired")} 
                    className={`sm:w-1/2 text-center text-xsmall text-lightPurple rounded-20 px-6 py-2 hover:cursor-pointer ${sessionType === "Expired" ? "bg-purple text-white" : "hover:bg-lightPurple hover:bg-opacity-50 hover:text-white"} transition`}
                  >
                    Expired
                  </div>
                </div>
                <div className="text-purple border border-purple hover:bg-purple rounded-15 py-2 px-4 hover:cursor-pointer hover:text-white text-center items-center justify-center transition" onClick={executeSessionTransfer}>Transfer 0.001 LYX</div>
              </div>
              <div className={`flex flex-col gap-6 h-full bg-white rounded-15 py-8 transition`}>
                {
                  (sessionType === "Active" ? activeSessions : expiredSessions)?.map((sessionedAddress, index) => (
                    <div key={index} className="flex w-full hidden sm:table-header-group grid grid-cols-12 border border-lightPurple border-opacity-25 rounded-15 py-2 px-4">
                      <div className="flex w-full justify-between items-center py-2">
                        <div className="flex items-center gap-4 sm:col-span-2 base:col-span-1 lg:col-span-5 text-purple font-normal">
                          <div className="text-small font-bold">{formatAddress(sessionedAddress.address)}</div>
                        </div>
                        <div className="sm:col-span-1 lg:col-span-4 text-purple font-normal flex">
                          <div onClick={() => togglePermissionsDropdown(sessionedAddress.address)} className="font-bold text-xsmall transition hover:cursor-pointer">show more</div>
                        </div>
                      </div> 
                      {visibilityStates[sessionedAddress.address] && (
                        <div  
                          className={`flex w-full justify-between ${dropdownVisible[sessionedAddress.address] ? 'animate-reveal' : 'animate-conceal'} py-4 transition text-xsmall overflow-y-auto hide-scrollbar`}
                          style={{ animationFillMode: 'forwards' }}
                        >
                          <div className="flex flex-col justify-between">
                            <div className="flex w-[150px] gap-4">
                              <input 
                                type="number" 
                                placeholder="Session Time..." 
                                className="px-4 py-2 sm:w-[200px] base:w-[350px] md:w-[500px] border border-lightPurple rounded-15 focus:outline-purple"
                                onChange={(e) => { setUpdatedSession(e.target.value); setUpdatedSessionAddress(sessionedAddress.address); setHasProvidedUpdatedTime(isValidEthereumAddress(e.target.value));}}
                              />
                              <div className="relative w-48">
                                <div className="cursor-pointer p-2 border border-lightPurple rounded-15 px-6" onClick={toggleDropdown}>
                                    {selectedOption}
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    </span>
                                </div>
          
                                {isOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-lightPurple rounded-15 px-2">
                                        {options.map((option, index) => (
                                            <div 
                                                key={index} 
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleOptionClick(option)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <button disabled={isUpdatingSession} onClick={updateSession} className="mt-32 flex border border-lightPurple py-2 px-4 text-lightPurple hover:bg-lightPurple rounded-15 hover:text-white hover:cursor-pointer transition text-center items-center justify-center">
                                {isUpdatingSession ? "Updating..." : "Update Session"}
                              </button>
                              {sessionType === "Active" && <button disabled={isTerminatingSession} onClick={() => {terminateSession(sessionedAddress.address)}} className="mt-32 flex border border-red py-2 px-4 text-red hover:bg-red rounded-15 hover:text-white hover:cursor-pointer transition text-center items-center justify-center">
                                {isTerminatingSession ? "Terminating..." : "Terminate Session"}
                              </button> }
                            </div>
                          </div>
                          <div className="flex flex-col gap-4 py-2">
                            <div className="text-medium text-purple font-bold">Session</div>
                            <div className="flex gap-2 text-lightPurple">
                              <span className="font-bold text-purple">Start Time:</span> {sessionedAddress.startTime}
                            </div>
                            <div className="flex gap-2 text-lightPurple">
                            <span className="font-bold text-purple">End Time:</span> {sessionedAddress.session}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                }
                {sessionType === "Active"? (
                  activeSessions && activeSessions.length === 0 && <div className="flex w-full justify-center py-4 text-lightPurple">No Active Sessions</div>
                )
                :
                (
                  expiredSessions && expiredSessions.length === 0 && <div className="flex w-full justify-center py-4  text-lightPurple">No Expired Sessions</div>
                )}
              </div>

              </div>
            </div>
          )
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