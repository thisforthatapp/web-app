'use client'

import { useState } from 'react'

import { Footer } from '@/components'
import { ActivityFeed, Grid } from '@/components/home'
import { useIsMobile } from '@/hooks'
import { Activity, Image as ImageIcon } from '@/icons'

type Tab = 'grid' | 'feed'

export default function Home() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<Tab>('grid')

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div className={`w-full relative bg-[#f9f9f9] flex ${isMobile ? 'mb-16' : 'mb-[50px]'}`}>
        <ContentArea activeTab={activeTab} isMobile={isMobile} />
      </div>
      {isMobile ? (
        <MobileFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <Footer />
      )}
    </div>
  )
}

interface ContentAreaProps {
  activeTab: Tab
  isMobile: boolean
}

const ContentArea: React.FC<ContentAreaProps> = ({ activeTab, isMobile }) => (
  <>
    {(!isMobile || activeTab === 'grid') && <Grid />}
    {(!isMobile || activeTab === 'feed') && <ActivityFeed showCollapsibleTab={!isMobile} />}
  </>
)

interface MobileFooterProps {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

const MobileFooter: React.FC<MobileFooterProps> = ({ activeTab, setActiveTab }) => (
  <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16'>
    <FooterTab
      isActive={activeTab === 'grid'}
      onClick={() => setActiveTab('grid')}
      icon={<ImageIcon className='w-5 h-5' />}
      label='Browse NFTs'
    />
    <FooterTab
      isActive={activeTab === 'feed'}
      onClick={() => setActiveTab('feed')}
      icon={<Activity className='w-5 h-5' />}
      label='Latest Activity'
    />
  </div>
)

interface FooterTabProps {
  isActive: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

const FooterTab: React.FC<FooterTabProps> = ({ isActive, onClick, icon, label }) => (
  <button
    className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 ${
      isActive ? 'bg-gray-100 font-semibold' : 'bg-white font-medium'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className='text-sm font-medium'>{label}</span>
  </button>
)
