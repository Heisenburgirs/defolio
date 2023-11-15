import { useState } from "react";

const TokenType = () => {
  const tokenTypes = ["LSP7", "LSP8"]
  const [tokenType, setTokenType] = useState("LSP7")


  return (
    <div className="flex gap-2 items-center md:justify-center border border-lightPurple rounded-20 p-[2px]">
      <div onClick={() => {setTokenType("LSP7")}} className={`sm:w-1/2 text-center text-xsmall text-lightPurple rounded-20 px-4 py-2 hover:cursor-pointer ${tokenType === "LSP7" ? "bg-purple text-white" : "hover:bg-lightPurple hover:bg-opacity-50 hover:text-white"} transition`}>Tokens</div>
      <div onClick={() => {setTokenType("LSP8")}} className={`sm:w-1/2 text-center text-xsmall text-lightPurple rounded-20 px-6 py-2 hover:cursor-pointer ${tokenType === "LSP8" ? "bg-purple text-white" : "hover:bg-lightPurple hover:bg-opacity-50 hover:text-white"} transition`}>NFTs</div>
    </div>
  )
}

export default TokenType;