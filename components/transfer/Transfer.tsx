import { copyToClipboard } from "@/app/utils/useCopyToCliptboard";
import { formatAddress } from "@/app/utils/useFormatAddress";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react"
import { useAccount } from "wagmi";
import { NotificationType, notify } from "../toast/Toast";
import QRCode from "react-qr-code";
import Image from 'next/image'
import copy from '@/public/icons/copy.svg';
import { useAssets } from "@/GlobalContext/AssetsContext.tsx/AssetsContext";
import SearchBar from "../searchbar/SearchBar";
import TokenType from "../tokentype/TokenType";

const Transfer = () => {
  const { address, isConnected } = useAccount();
  const { tokenBalances } = useAssets()
  const menuItems = ["Send", "Receive"];
  const [tokenType, setTokenType] = useState<string>("LSP7")

  const [menuSelected, setMenuSelected] = useState<string>("Send");
  const [everythingFilled, setEverythingFilled] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");

  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isDropDownTokenSet, setIsDropDownTokenSet] = useState<boolean>(false);
  const [dropDownToken, setDropDownToken] = useState<string>("");
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
    if (recipientAddress !== "" && selectedAsset !== "" && sendAmount !== "") {
        setEverythingFilled(true);
    } else {
        setEverythingFilled(false);
    }
  }, [recipientAddress, selectedAsset, sendAmount]);

  const transfer = async () => {
    console.log("tokenBalances", tokenBalances)
  }

  useEffect(() =>{
    console.log(recipientAddress)
  }, [recipientAddress])
  
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
                      <h1 className="text-lightPurple font-bold">Asset</h1>
                      <input
                        type="text"
                        placeholder="Select asset..."
                        onClick={() => setIsDropDownOpen(!isDropDownOpen)}
                        onChange={e => {
                          setIsDropDownTokenSet(true);
                          setDropDownToken(e.target.value);
                        }}
                        value={selectedAsset}
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
                                  (tokenType === "LSP7" ? filteredLSP7Tokens : filteredLSP8Tokens).map((token, index) => (
                                    <div 
                                      key={index}
                                      className="flex cursor-pointer px-2 py-4 transition border-b border-lightPurple border-opacity-25" 
                                      onClick={() => {
                                        setIsDropDownOpen(false);
                                        setIsDropDownTokenSet(true);
                                        setDropDownToken(token.Name);
                                      }}
                                    >
                                      {token.Name}
                                    </div>
                                  ))
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

                    <div className="flex flex-col gap-2">
                      <h1 className="text-lightPurple font-bold">Amount</h1>
                      <input type="text" placeholder="Enter amount..." className="border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4"/>
                    </div>
                  </div>

                  <button disabled={everythingFilled} onClick={transfer} className={`w-full py-2 rounded-15 text-white bg-purple ${!everythingFilled ? "hover:cursor-pointer" : "opacity-75 hover:cursor-not-allowed"}`}>Send</button>
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
                    <input type="text" placeholder="Enter address..." value={formatAddress(address || "0x0")} className="border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4 pointer-events-none"/>
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