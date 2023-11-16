import { copyToClipboard } from "@/app/utils/useCopyToCliptboard";
import { formatAddress } from "@/app/utils/useFormatAddress";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react"
import { useAccount } from "wagmi";
import { NotificationType, notify } from "../toast/Toast";
import { isValidEthereumAddress } from "@/app/utils/useIsValidEthereumAddress";
import { ethers } from "ethers";
import { useAssets } from "@/GlobalContext/AssetsContext.tsx/AssetsContext";
import QRCode from "react-qr-code";
import Image from 'next/image';
import copy from '@/public/icons/copy.svg';
import tooltip from '@/public/icons/tooltip.png';
import SearchBar from "../searchbar/SearchBar";
import TokenType from "../tokentype/TokenType";
import LSP7ABI from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';
import LSP8ABI from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';
import { numberToBytes32 } from "@/app/utils/useBytes32";
import Tooltip from '@mui/material/Tooltip';

const Transfer = () => {
  const { address, isConnected } = useAccount();
  const { tokenBalances } = useAssets()
  const [tokenType, setTokenType] = useState<string>("LSP7")

  const [menuSelected, setMenuSelected] = useState<string>("Send");
  const [everythingFilled, setEverythingFilled] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<TokenRow>({
    Address: '',
    Name: '',
    Symbol: '',
    Price: '',
    TokenAmount: '',
    TokenValue: '',
    TokenID: []
  });;
  const [selectedTokenId, setSelectedTokenId] = useState<string>()
  const [sendAmount, setSendAmount] = useState<string>("");
  const [safeTransfer, setSafeTransfer] = useState<boolean>(true)

  const [isNFTSelected, setIsNFTSelected] = useState<boolean>(false);

  useEffect(() => {
    if (isNFTSelected && recipientAddress !== "" && selectedAsset.Address !== "") {
      setEverythingFilled(true)
    } else if (!isNFTSelected && recipientAddress !== "" && selectedAsset.Address !== "" && sendAmount !== "") {
      setIsNFTSelected(false)
    } 

  }, [isNFTSelected])

  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredLSP7Tokens = tokenBalances.LSP7.filter(token => 
    token.Name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.Symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLSP8Tokens = tokenBalances.LSP8.filter(token => 
    token.Name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.Symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (
      recipientAddress !== "" &&
      selectedAsset.Address !== "" &&
      sendAmount !== "" ||
      recipientAddress !== "" &&
      selectedAsset.Address !== "" &&
      isNFTSelected
    ) {
        setEverythingFilled(true);
    } else {
        setEverythingFilled(false);
    }
  }, [recipientAddress, selectedAsset, sendAmount]);

  const transfer = async () => {
    // Check if selectedAsset is a valid Ethereum address
    if (selectedAsset)

    if (!isValidEthereumAddress(selectedAsset?.Address)) {
      notify("Invalid token", NotificationType.Error)
      return;
    }

    // Check if recipientAddress is a valid Ethereum address
    if (!isValidEthereumAddress(recipientAddress)) {
      notify("Invalid recipient", NotificationType.Error)
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.lukso);
    const signer = provider.getSigner();
    const LSP8contract = new ethers.Contract(selectedAsset.Address, LSP8ABI.abi, signer);
    const LSP7contract = new ethers.Contract(selectedAsset.Address, LSP7ABI.abi, signer);

    if (isNFTSelected) {
      try {
        const transaction = await LSP8contract.transfer(address, recipientAddress, numberToBytes32(Number(selectedAsset.TokenID[0])), safeTransfer, '0x');
        await transaction.wait();
        notify("NFT transferred", NotificationType.Success)
        console.log("Transfer successful");
      } catch (error) {
        notify("Error sending NFT", NotificationType.Error)
        console.log(error)
        return;
      }

    } else {
      try {
        const amount = ethers.utils.parseUnits(sendAmount, 'ether');
        
        const transaction = await LSP7contract.transfer(address, recipientAddress, amount, safeTransfer, '0x');
        await transaction.wait();
        notify("Token transferred", NotificationType.Success)
        console.log("Transfer successful");
      } catch (error) {
        notify("Error sending Token", NotificationType.Error)
        console.log(error)
        return;
      }
    }
  }

  const test = () => {
    console.log(safeTransfer)
  }

  return (
    <div className="flex sm:flex-col lg:flex-row w-full justify-center sm:pt-12 lg:pt-32">
        <div className="flex flex-col gap-10 py-6 px-12 bg-white shadow rounded-15">
          <div className="flex gap-4">
            <button onClick={() => {setMenuSelected("Send")}} className={`w-[150px] py-4 text-small text-lightPurple font-bold ${menuSelected === "Send" && "text-purple border-b-2"}`}>Send</button>
            <button onClick={() => {setMenuSelected("Receive")}} className={`w-[150px] py-4 text-small text-lightPurple font-bold ${menuSelected === "Receive" && "text-purple border-b-2"}`}>Receive</button>
          </div>

          {menuSelected === "Send" ?
            (
              isConnected ? (  
                <div className="flex flex-col gap-12">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <h1 className="text-lightPurple font-bold">Send To</h1>
                      <input type="text" placeholder="Enter address..." onChange={(e) => {setRecipientAddress(e.target.value)}} className="border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4"/>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h1 onClick={test} className="text-lightPurple font-bold">Asset</h1>
                      <input
                        type="text"
                        placeholder="Select asset..."
                        onClick={() => setIsDropDownOpen(!isDropDownOpen)}
                        onChange={(e) => {setIsDropDownOpen(!isDropDownOpen)}}
                        value={selectedAsset?.Name}
                        className="w-full border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4"
                      />

                      {isDropDownOpen && (
                        tokenBalances ? (
                          <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                            <div className="flex flex-col bg-background gap-8 p-4 rounded-10 shadow">
                              <div className="flex w-full justify-evenly items-center text-purple font-bold">
                                <div className="w-full text-center text-medium">Select asset to send</div>
                                <div className="hover:cursor-pointer" onClick={() => {setIsDropDownOpen(false)}}>X</div>
                              </div>
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <TokenType tokenType={tokenType} setTokenType={setTokenType} />
                                <SearchBar placeholder="search tokens..." onSearch={value => setSearchQuery(value)} />
                              </div>
                              <div className="flex flex-col gap-2 h-[400px] overflow-y-auto">
                                {
                                  tokenType === "LSP7" ? 
                                    filteredLSP7Tokens.map((token, index) => (
                                      <div 
                                        key={index}
                                        className="flex cursor-pointer px-2 py-4 transition border-b border-lightPurple border-opacity-25"
                                        onClick={() => {
                                          setIsDropDownOpen(false);
                                          setSelectedAsset(prevState => ({
                                            ...prevState,
                                            Name: token.Name,
                                            Address: token.Address,
                                          }));
                                          setIsNFTSelected(false);
                                        }}
                                      >
                                        {token.Name}
                                      </div>
                                    ))
                                  :
                                    filteredLSP8Tokens.flatMap((token, index) => 
                                      token.TokenID.map((tokenId, tokenIdIndex) => (
                                        <div 
                                          key={`${index}-${tokenIdIndex}`}
                                          className="flex cursor-pointer px-2 py-4 transition border-b border-lightPurple border-opacity-25"
                                          onClick={() => {
                                            setIsDropDownOpen(false);
                                            setSelectedAsset(prevState => ({
                                              ...prevState,
                                              Address: token.Address,
                                              Name: token.Name,
                                              TokenID: [tokenId]
                                            }));
                                            setSelectedTokenId(tokenId);
                                            setIsNFTSelected(true);
                                          }}
                                        >
                                          {`${token.Name} - Token ID ${tokenId}`}
                                        </div>
                                      ))
                                    )
                                }
                              </div>
                            </div>
                          </div>
                        )
                        :
                        (
                          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                            <div className="bg-background p-4 max-w-md w-full rounded-10 shadow">
                              No assets...
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className={`flex flex-col gap-2 ${isNFTSelected ? "pointer-events-none opacity-50" : "opacity-100"}`}>
                      <h1 className="text-lightPurple font-bold">Amount</h1>
                      <input type="number" placeholder="Enter amount..." onChange={(e) => {setSendAmount(e.target.value)}} className="border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4"/>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <div onClick={() => {setSafeTransfer(!safeTransfer)}} className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <div
                          onChange={() => {setSafeTransfer(!safeTransfer)}}
                          className="toggle-checkbox absolute block rounded-15 w-5 h-5 rounded-full bg-white appearance-none cursor-pointer"
                          style={{ top: '2px', left: safeTransfer ? '26px' : '2px', transition: 'left 0.2s' }}
                        />
                        <label
                          className={`toggle-label block overflow-hidden h-6 w-12 rounded-full ${safeTransfer ? "bg-green bg-opacity-100" : "bg-black bg-opacity-20"} rounded-15 px-2 cursor-pointer`}
                          style={{ padding: '2px' }}
                        ></label>
                      </div>
                      <div className="text-xsmall text-lightPurple font-bold">Safe Transfer</div>
                      <Tooltip title="Allow transfer to non-Universal Profile addresses">
                        <Image src={tooltip} width={16} height={16} alt="Tooltip" />
                      </Tooltip>
                    </div>
                  </div>

                  <button disabled={!everythingFilled} onClick={transfer} className={`w-full py-2 rounded-15 text-white bg-purple ${everythingFilled ? "hover:cursor-pointer" : "opacity-75 hover:cursor-not-allowed"}`}>Send</button>
                </div>
              )
              :
              (
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              )
            ) 
            :
            (
              isConnected ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-lightPurple font-bold">Account</h1>
                    <input type="text" placeholder="Enter address..." readOnly={true} value={formatAddress(address || "0x0")} className="border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4 pointer-events-none"/>
                  </div>
  
                  <div className="flex justify-center py-4">
                    {address && <QRCode value={address} />}
                  </div>
                  <div
                    className="flex justify-center items-center gap-2 text-center py-2 rounded-15 border border-lightPurple text-purple hover:cursor-pointer"
                    onClick={() => {copyToClipboard(address); notify("Address Copied", NotificationType.Success)}}
                  >
                    <Image src={copy} width={18} height={18} alt="Copy Address "/>
                    <div>Copy Address</div>
                  </div>
                </div>
              )
              :
              (
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              )
            )
          }
        </div>
    </div>
  )
}

export default Transfer