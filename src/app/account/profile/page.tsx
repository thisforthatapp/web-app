// TODO: Add wallets to profile
// TODO: Add NFTs as choice for profile pic

'use client'

import { FC, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { useAuth } from '@/providers/authProvider'
import { Profile } from '@/types/supabase'
import { BLOCKED_USERNAMES } from '@/utils/constants'
import { uploadFile } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2mb max upload size

const AccountProfilePage: FC = () => {
  const { user, profile: initialProfile } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingFileUpload, setLoadingFileUpload] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
    }
  }, [initialProfile])

  const handleSaveProfile = async () => {
    if (!profile) return

    if (profile.username && BLOCKED_USERNAMES.includes(profile.username)) {
      alert(`${profile.username} is not a valid username. Please pick another one.`)
      return
    }

    setLoading(true)

    const updatedProfile = { ...initialProfile, ...profile }

    const { error } = await supabase
      .from('user_profile')
      .upsert({
        id: user?.id,
        username: updatedProfile.username,
        bio: updatedProfile.bio,
        profile_pic_url: updatedProfile.profile_pic_url,
      })
      .select()

    setLoading(false)

    if (error) {
      alert('Update profile failed. Username might be taken. Please try another.')
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    if (file.size > MAX_IMAGE_SIZE) {
      setFormErrors({ file: 'File size exceeds 2MB.' })
      return
    }

    setLoadingFileUpload(true)
    const formData = new FormData()
    formData.append('file', file)
    const token = (await supabase.auth.getSession()).data.session?.access_token

    if (!token) {
      setLoadingFileUpload(false)
      alert('Unexpected error. Please try again.')
      return
    }

    const response = await uploadFile(formData, token)
    setLoadingFileUpload(false)

    if (response && response.key) {
      setProfile((prevProfile) =>
        prevProfile ? { ...prevProfile, profile_pic_url: response.key } : prevProfile,
      )
    }
  }

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div className='flex flex-col flex-1 p-4 bg-gray-100 overflow-y-auto hide-scrollbar'>
        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <div className='text-xl font-semibold mb-4'>Profile Picture</div>
          <div className='flex items-center'>
            <div
              {...getRootProps()}
              className='w-[80px] h-[80px] shrink-0 bg-[#7e7e7e] rounded-full text-white items-center justify-center flex cursor-pointer dropzone'
            >
              <input {...getInputProps()} />
              <img
                src={
                  profile.profile_pic_url
                    ? process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profile.profile_pic_url
                    : process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profile.profile_pic_url
                }
                alt='Profile Picture'
                className='w-full h-full bg-white object-cover rounded-full'
              />
            </div>
            <div className='ml-4 flex flex-col gap-y-1'>
              <div className='flex'>
                <div className='cursor-pointer lg:hover:underline' onClick={open}>
                  Upload a file
                </div>
                {loadingFileUpload && <div className='ml-1.5 loader' />}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Basic Information</h2>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Username
              </label>
              <input
                type='text'
                id='username'
                value={profile.username}
                onChange={(e) => {
                  const rawValue = e.target.value
                  const normalizedUsername = rawValue
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                  setProfile({ ...profile, username: normalizedUsername })
                }}
                className='mt-1 h-[45px] bg-gray-100 w-full rounded-md px-[12px]'
              />
            </div>
            <div>
              <label htmlFor='bio' className='block text-sm font-medium text-gray-700 mb-1'>
                Bio
              </label>
              <textarea
                id='bio'
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className='mt-1 h-[100px] bg-gray-100 w-full rounded-md p-[12px] resize-none'
              ></textarea>
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          className='h-[50px] flex items-center justify-center shrink-0 w-full mt-auto text-lg bg-gray-800 text-white font-semibold rounded-md'
          disabled={loading}
        >
          {loading ? <div className='loader'></div> : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default AccountProfilePage
