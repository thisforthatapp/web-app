import { Address } from 'viem'

type ContractAddresses = {
  [chainId: number]: Address
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  1: '0x...' as Address, // mainnet
  11155111: '0x...' as Address, // sepolia
  31337: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707' as Address, // anvil
}
