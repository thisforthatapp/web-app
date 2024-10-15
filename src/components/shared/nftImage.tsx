import { FC, useState } from 'react'
import { Tooltip } from 'react-tooltip'

interface NFTImageProps {
  src: string
  alt: string
  fallback: string
  showTooltip?: boolean
  tooltipId?: string
  tooltipText?: string
}

const NFTImage: FC<NFTImageProps> = ({
  src,
  alt,
  fallback,
  showTooltip = false,
  tooltipId = '',
  tooltipText = '',
}) => {
  const [error, setError] = useState<boolean>(false)

  const imageContent = error ? (
    <div className='aspect-square flex items-center justify-center text-center p-4 bg-gray-200 rounded-t-lg'>
      <span className='text-gray-600 font-semibold break-words'>{fallback}</span>
    </div>
  ) : (
    <div className='w-full aspect-square rounded-md overflow-hidden shadow-sm relative group'>
      <img
        src={src}
        alt={alt}
        className='w-full h-full object-cover transition-transform duration-200 group-hover:scale-110'
        onError={() => setError(true)}
      />
      <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-2'>
        <span className='text-white text-sm font-semibold break-words text-center'>
          {fallback}
        </span>
      </div>
    </div>
  )

  if (showTooltip) {
    return (
      <>
        <div data-tooltip-id={tooltipId}>{imageContent}</div>
        <Tooltip id={tooltipId} place='bottom'>
          {tooltipText}
        </Tooltip>
      </>
    )
  }

  return imageContent
}

export default NFTImage
