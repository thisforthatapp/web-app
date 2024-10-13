'use client'

import React from 'react'
import { Tooltip } from 'react-tooltip'

import { Verified } from '@/icons'

interface VerifiedProps {
  id: string
  isVerified: boolean
  chainName: string
  collectionName: string
  tokenId: string
  className?: string
}

const VerifiedBadge: React.FC<VerifiedProps> = ({
  id,
  isVerified,
  chainName,
  collectionName,
  tokenId,
  className,
}) => {
  const tooltipContent = `
    <b>${isVerified ? 'Verified' : 'Unverified'}</b>
    Chain: ${chainName}
    Collection: ${collectionName || '-'}
    ID: ${tokenId.length > 8 ? `${tokenId.substring(0, 8)}... ` : tokenId}
  `
    .trim()
    .replace(/\n/g, '<br>')

  return (
    <div className={className}>
      <Verified
        isVerified={isVerified}
        className='w-full h-full'
        data-tooltip-id={`verified-tooltip-${id}`}
        data-tooltip-html={tooltipContent}
      />
      <Tooltip id={`verified-tooltip-${id}`} place='bottom' html={tooltipContent} />
    </div>
  )
}

export default VerifiedBadge
