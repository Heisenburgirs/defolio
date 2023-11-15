import { ethers } from "ethers";

export const numberToBytes32 = (num: number) => {
  // Convert the number to a BigNumber using ethers
  const bigNum = ethers.BigNumber.from(num);

  // Format the BigNumber as a bytes32 string
  const bytes32 = ethers.utils.hexZeroPad(bigNum.toHexString(), 32);

  return bytes32;
}