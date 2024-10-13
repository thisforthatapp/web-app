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
    <img
      src={src}
      alt={alt}
      className='aspect-square object-cover w-full h-full rounded-t-lg'
      onError={() => setError(true)}
    />
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
