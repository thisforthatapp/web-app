import { type SVGProps } from 'react'

export default function Tag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg enableBackground='new 0 0 24 24;' viewBox='0 0 24 24' {...props}>
      <path
        d='M23,3c0-1.1-0.9-2-2-2l-7.3,0c-0.5,0-1,0.2-1.4,0.6L1.6,12.3c-0.8,0.8-0.8,2.1,0,2.9l7.3,7.3   c0.8,0.8,2.1,0.8,2.9,0l10.7-10.7c0.4-0.4,0.6-0.9,0.6-1.4L23,3z M17,9.1c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2s2,0.9,2,2   C19,8.2,18.1,9.1,17,9.1z'
        fill='currentColor'
      />
    </svg>
  )
}
