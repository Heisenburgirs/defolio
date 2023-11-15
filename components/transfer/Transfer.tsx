import { copyToClipboard } from "@/app/utils/useCopyToCliptboard";
import { formatAddress } from "@/app/utils/useFormatAddress";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react"
import { useAccount } from "wagmi";
import { NotificationType, notify } from "../toast/Toast";
import QRCode from "react-qr-code";
import Image from 'next/image'
import copy from '@/public/icons/copy.svg';

const Transfer = () => {
  const { address, isConnected } = useAccount();
  const menuItems = ["Send", "Receive"];

  const [menuSelected, setMenuSelected] = useState<string>("Send");
  const [everythingFilled, setEverythingFilled] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  
  useEffect(() => {
    if (recipientAddress !== "" && selectedAsset !== "" && sendAmount !== "") {
        setEverythingFilled(true);
    } else {
        setEverythingFilled(false);
    }
  }, [recipientAddress, selectedAsset, sendAmount]);

  const transfer = async () => {
    console.log("t")
  }
  
  return (
    <div className="flex sm:flex-col md:flex-row w-full justify-center pt-32">
        <div className="flex flex-col gap-10 py-6 px-12 bg-white rounded-15">
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
                      <input type="text" placeholder="Enter address..." className="border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4"/>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h1 className="text-lightPurple font-bold">Asset</h1>
                      <input type="text" placeholder="Select asset..." className="border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4"/>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h1 className="text-lightPurple font-bold">Amount</h1>
                      <input type="text" placeholder="Enter amount..." className="border border-lightPurple border-opacity-50 focus:outline-purple px-4 text-xsmall rounded-10 py-4"/>
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