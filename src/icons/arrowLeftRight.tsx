import { type SVGProps } from 'react'

export default function ArrowLeftRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M8 3L4 7l4 4' />
      <path d='M4 7h16' />
      <path d='m16 21 4-4-4-4' />
      <path d='M20 17H4' />
    </svg>
  )
}
