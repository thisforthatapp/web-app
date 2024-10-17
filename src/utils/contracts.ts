import { Address } from 'viem'

type ContractAddresses = {
  [chainId: number]: Address
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  1: '0x...' as Address, // mainnet
  11155111: '0x...' as Address, // sepolia
  31337: '0x50cf1849e32E6A17bBFF6B1Aa8b1F7B479Ad6C12' as Address, // anvil
}
