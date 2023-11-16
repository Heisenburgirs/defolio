import { ethers } from "ethers";

export const numberToBytes32 = (num: number) => {
  // Convert the number to a BigNumber using ethers
  const bigNum = ethers.BigNumber.from(num);

  // Format the BigNumber as a bytes32 string
  const bytes32 = ethers.utils.hexZeroPad(bigNum.toHexString(), 32);

  return bytes32;
}

export const bytes32ToNumber = (bytes32: string) => {
  // Convert the bytes32 string to a BigNumber
  const bigNum = ethers.BigNumber.from(bytes32);

  // Convert the BigNumber to a regular number
  return bigNum.toNumber();
}