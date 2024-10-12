'use client'

import React from 'react'
import { Tooltip } from 'react-tooltip'

import { Verified } from '@/icons'

interface VerifiedProps {
  id: string
  isVerified: boolean
  className?: string
}

const VerifiedBadge: React.FC<VerifiedProps> = ({ id, isVerified, className }) => (
  <div className={className}>
    <Verified
      isVerified={isVerified}
      className='w-full h-full'
      data-tooltip-id={`verified-tooltip-${id}`}
    />
    <Tooltip
      id={`verified-tooltip-${id}`}
      place='bottom'
      content={isVerified ? 'ownership verified' : 'ownership not verified'}
    />
  </div>
)

export default VerifiedBadge
