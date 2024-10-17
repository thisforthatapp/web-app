import { type SVGProps } from 'react'

export default function ChevronUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <polyline points='18 15 12 9 6 15'></polyline>
    </svg>
  )
}
