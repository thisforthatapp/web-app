// TODO: check chain logos

import React from 'react'

interface ChainLogoProps {
  chainId: number
  size?: number
  className?: string
}

const ChainLogo: React.FC<ChainLogoProps> = ({ chainId, size = 24, className = '' }) => {
  const logos: { [key: number]: JSX.Element } = {
    // Ethereum
    1: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'>
        <path fill='#8A92B2' d='M16 0L6 16L16 21.5L26 16L16 0Z' />
        <path fill='#62688F' d='M16 0L6 16L16 21.5V0Z' />
        <path fill='#8A92B2' d='M16 23.4L6 17.9L16 32L26 17.9L16 23.4Z' />
        <path fill='#62688F' d='M16 32V23.4L6 17.9L16 32Z' />
      </svg>
    ),
    // Base
    8453: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
        <circle cx='16' cy='16' r='16' fill='#0052FF' />
        <path
          d='M16 7C11.0294 7 7 11.0294 7 16C7 20.9706 11.0294 25 16 25C20.9706 25 25 20.9706 25 16C25 11.0294 20.9706 7 16 7ZM16 22.5C12.4101 22.5 9.5 19.5899 9.5 16C9.5 12.4101 12.4101 9.5 16 9.5C19.5899 9.5 22.5 12.4101 22.5 16C22.5 19.5899 19.5899 22.5 16 22.5Z'
          fill='white'
        />
      </svg>
    ),
    // Arbitrum
    42161: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
        <circle cx='16' cy='16' r='16' fill='#28A0F0' />
        <path d='M19.5 7L20.5 8.6L14 21.6L13 20L19.5 7Z' fill='white' />
        <path d='M22 13.5L23 15.1L18 24.1L17 22.5L22 13.5Z' fill='white' />
        <path d='M9 19.5L13 24.9L12 26.5L8 21.1L9 19.5Z' fill='white' />
      </svg>
    ),
    // Optimism
    10: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
        <circle cx='16' cy='16' r='16' fill='#FF0420' />
        <path d='M10 8H22V24H10V8Z' fill='white' />
        <path d='M14 12H18V20H14V12Z' fill='#FF0420' />
      </svg>
    ),
    // Polygon
    137: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
        <circle cx='16' cy='16' r='16' fill='#8247E5' />
        <path d='M21 11L18 9.5L15 11V14L18 15.5L21 14V11Z' fill='white' />
        <path d='M21 18L18 19.5L15 18V15L18 13.5L21 15V18Z' fill='white' />
        <path d='M17 21L14 22.5L11 21V18L14 16.5L17 18V21Z' fill='white' />
        <path d='M17 11L14 9.5L11 11V14L14 15.5L17 14V11Z' fill='white' />
      </svg>
    ),
    // Zksync
    324: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
        <circle cx='16' cy='16' r='16' fill='#8C8DFC' />
        <path d='M9 11L16 7L23 11V21L16 25L9 21V11Z' fill='white' />
        <path d='M16 15L13 17L16 19L19 17L16 15Z' fill='#8C8DFC' />
      </svg>
    ),
  }

  const DefaultLogo = (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
      <circle cx='16' cy='16' r='16' fill='#CCCCCC' />
      <text x='16' y='22' fontSize='20' fill='#666666' textAnchor='middle'>
        ?
      </text>
    </svg>
  )

  return (
    <div style={{ width: size, height: size }} className={className}>
      {logos[chainId] || DefaultLogo}
    </div>
  )
}

export default ChainLogo
