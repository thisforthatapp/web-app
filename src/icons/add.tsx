import { type SVGProps } from 'react'

export default function Add(props: SVGProps<SVGSVGElement>) {
  return (
    <svg height='24px' viewBox='0 0 24 24' width='24px' {...props}>
      <path
        d='M18,10h-4V6c0-1.104-0.896-2-2-2s-2,0.896-2,2l0.071,4H6c-1.104,0-2,0.896-2,2s0.896,2,2,2l4.071-0.071L10,18  c0,1.104,0.896,2,2,2s2-0.896,2-2v-4.071L18,14c1.104,0,2-0.896,2-2S19.104,10,18,10z'
        fill='currentColor'
      />
    </svg>
  )
}
