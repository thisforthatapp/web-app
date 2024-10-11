import { FC, useState } from 'react'

interface NFTImageProps {
  src: string
  alt: string
  fallback: string
}

const NFTImage: FC<NFTImageProps> = ({ src, alt, fallback }) => {
  const [error, setError] = useState<boolean>(false)

  if (error) {
    return (
      <div className='aspect-square flex items-center justify-center text-center p-4 bg-gray-200'>
        <span className='text-gray-600 font-semibold break-words'>{fallback}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className='aspect-square object-cover w-full h-full'
      onError={() => setError(true)}
    />
  )
}

export default NFTImage
