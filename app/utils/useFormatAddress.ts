
export const formatAddress = (address: string) => {
  // Check if the address is valid and has the expected length (42 characters including the '0x' prefix)
  if (address && address.startsWith('0x') && address.length === 42) {
    // Take the first 6 characters after '0x' and the last 4 characters
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  } else {
    console.log("Address not valid")
  }
}