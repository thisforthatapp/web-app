"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "react-modal";
import { useIsMobile } from "@/hooks";
import { uploadFile } from "@/utils/helpers";
import { BLOCKED_USERNAMES } from "@/utils/constants";
import { supabase } from "@/utils/supabaseClient";
import { getModalStyles } from "@/styles";
import { NftSelector } from "@/components/shared";
import { User } from "@/icons";
import { NFT } from "@/types/supabase";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2mb max upload size

interface Props {
  closeModal: () => void;
}

const Onboard: React.FC<Props> = ({ closeModal }) => {
  const isMobile = useIsMobile();
  const customStyles = getModalStyles(isMobile);

  const [completeScreen, setCompleteScreen] = useState(false);
  const [step, setStep] = useState(1);

  // step 1 - profile info
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [loadingFileUpload, setLoadingFileUpload] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setFormErrors({});

    let errors = {};
    if (!username.trim()) {
      errors = { ...errors, username: "Username is required." };
    }
    if (!bio.trim()) {
      errors = { ...errors, bio: "Bio is required." };
    }
    if (!profileImage) {
      errors = { ...errors, file: "Profile picture is required." };
    }
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const normalizedUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    if (BLOCKED_USERNAMES.includes(normalizedUsername)) {
      setFormErrors({
        username: `${username} is not a valid username. Please pick another one.`,
      });
      return;
    }

    setLoading(true);

    const { data: user } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("user_profile")
      .upsert({
        id: user.session?.user.id,
        username: normalizedUsername,
        bio,
        profile_pic_url: profileImage,
      })
      .select();

    setLoading(false);

    if (error) {
      alert(
        "Update profile failed. Username might be taken. Please try another."
      );
    } else {
      setStep(2);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file.size > MAX_IMAGE_SIZE) {
      setFormErrors({ file: "File size exceeds 2MB." });
      return;
    }

    setLoadingFileUpload(true);
    const formData = new FormData();
    formData.append("file", file);
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    if (!token) {
      setLoadingFileUpload(false);
      alert("Unexpected error. Please try again.");
      return;
    }

    const response = await uploadFile(formData, token);
    setLoadingFileUpload(false);

    if (response && response.key) {
      setProfileImage(response.key);
    } else {
      setFormErrors({ file: "Failed to upload file. Please try again." });
    }
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <Modal
      id="react-modal"
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={() => {
        if (completeScreen) {
          closeModal();
        }
      }}
      style={customStyles}
    >
      {completeScreen && (
        <div className="flex flex-col items-center p-12 items-center justify-center text-center overflow-y-auto hide-scrollbar">
          <div className="text-8xl">🎉</div>
          <div className="my-4">
            Congratulations, <b>{username}</b>.
          </div>
          <div>You&apos;ve finished setting up your account!</div>
          <div className="my-2">
            It&apos;s time to start swapping. Share your profile with others and
            check out the NFTs on offer!
          </div>
          <div className="font-semibold mt-2">
            www.thisforthat.app/{username}
          </div>
          <button
            className="mt-8 bg-indigo-500 text-white w-[350px] h-[45px] rounded font-semibold text-lg"
            onClick={closeModal}
          >
            Let&apos;s Go!
          </button>
        </div>
      )}
      {!completeScreen && (
        <>
          <div className="p-4 border-b border-gray-200">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-bold mb-1">
              Step {step} of 2
            </div>
            <div className="mt-1 leading-tight text-black">
              {step === 1 ? "Create Your Profile" : "Add Your NFTs"}
            </div>
          </div>

          {step === 1 && (
            <form
              onSubmit={handleProfileSubmit}
              className="flex flex-col h-full overflow-y-auto hide-scrollbar"
            >
              <div className="p-6 flex flex-col border-b border-gray-200/60">
                <div className="flex items-center">
                  <div className="text-gray-700 text-sm w-[130px]">
                    <div className="font-semibold">Profile Picture</div>
                  </div>
                  <div className="w-full items-center justify-center">
                    <div className="flex items-center justify-center">
                      <div
                        {...getRootProps()}
                        className="w-[80px] h-[80px] shrink-0 bg-[#7e7e7e] rounded-full text-white items-center justify-center flex cursor-pointer dropzone"
                      >
                        <input {...getInputProps()} />
                        {profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                              profileImage
                            }
                            alt="Profile Picture"
                            className="w-full h-full bg-white object-cover rounded-full"
                          />
                        ) : (
                          <User width="50" />
                        )}
                      </div>
                      <div className="ml-4 text-sm flex flex-col gap-y-1">
                        <div className="flex">
                          <div
                            className="cursor-pointer lg:hover:underline"
                            onClick={open}
                          >
                            Upload a file
                          </div>
                          {loadingFileUpload && (
                            <div className="ml-1.5 loader" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {formErrors.file && (
                  <p className="mt-4 text-sm text-red-600 flex justify-end">
                    {formErrors.file}
                  </p>
                )}
              </div>
              <div className="p-6 flex flex-col border-b border-gray-200/60">
                <div className="flex items-center">
                  <div className="text-gray-700 text-sm w-[140px] font-semibold">
                    Username
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const normalizedUsername = rawValue
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "");
                      setUsername(normalizedUsername);
                    }}
                    className="ml-4 w-full h-[38px] rounded-md bg-[rgba(22,24,35,0.06)] caret-[#8d00ff] outline-none border-none p-[7px_12px] box-border"
                  />
                </div>
                {formErrors.username && (
                  <p className="mt-4 text-sm text-red-600 flex justify-end">
                    {formErrors.username}
                  </p>
                )}
              </div>
              <div className="p-6 flex flex-col border-b border-gray-200/60">
                <div className="flex items-center">
                  <div className="text-gray-700 text-sm w-[140px] font-semibold">
                    Display Name
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    className="ml-4 w-full h-[38px] rounded-md bg-[rgba(22,24,35,0.06)] caret-[#8d00ff] outline-none border-none p-[7px_12px] box-border"
                  />
                </div>
                {formErrors.username && (
                  <p className="mt-4 text-sm text-red-600 flex justify-end">
                    {formErrors.username}
                  </p>
                )}
              </div>
              <div className="p-6 flex flex-col border-b border-gray-200/60">
                <div className="flex items-center">
                  <div className="text-gray-700 text-sm w-[140px] font-semibold">
                    Bio
                  </div>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="ml-4 w-full rounded-md bg-[rgba(22,24,35,0.06)] caret-[#8d00ff] outline-none border-none box-border h-[100px] p-[12px] resize-none"
                  />
                </div>
                {formErrors.bio && (
                  <p className="mt-4 text-sm text-red-600 flex justify-end">
                    {formErrors.bio}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto px-6 py-4 gap-x-4">
                <button
                  className={`h-[45px] text-gray-600 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                  disabled={loading}
                  onClick={async (e) => {
                    e.preventDefault();
                    await supabase.auth.signOut();
                    closeModal();
                  }}
                >
                  Logout
                </button>
                <button
                  className="h-[45px] bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  {loading ? (
                    <div className="loader !border-2 !border-white !border-t-2 !border-t-[#6466f1]"></div>
                  ) : (
                    "Next Step"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <>
              <NftSelector
                // selectedNfts={selectedNfts}
                // setSelectedNfts={setSelectedNfts}
                onComplete={() => {
                  setCompleteScreen(true);
                }}
              />
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default Onboard;
