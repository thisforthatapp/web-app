"use client";

import React from "react";
import Modal from "react-modal";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";

import { useIsMobile } from "@/hooks";
import { getModalStyles } from "@/styles";
import { Close, Google } from "@/icons";

interface Props {
  closeModal: () => void;
}

const Login: React.FC<Props> = ({ closeModal }) => {
  const isMobile = useIsMobile();
  const customStyles = getModalStyles(isMobile);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL,
      },
    });

    if (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <Modal
      id="react-modal"
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <div className="flex flex-col p-4 items-center text-center h-full justify-center sm:h-auto sm:justify-normal">
        <div
          className="absolute top-0 right-0 w-[75px] h-[75px] flex items-center justify-center cursor-pointer"
          onClick={closeModal}
        >
          <Close width="32" height="32" />
        </div>
        <Image src="/logo.png" alt="VoiceJam Logo" width={250} height={250} />
        <div className="text-3xl mb-4 font-bold">TFT - Swap NFTs for NFTs</div>
        <div className="gap-y-2 flex flex-col text-lg mb-4">
          <div>💎 Trade, Haggle, and Upgrade Your Collection</div>
          <div>💬 Meet Fellow NFT Enthusiasts</div>
          <div>🎉 Have Fun in the World of Digital Collectibles</div>
        </div>
        <div className="my-6 flex flex-col items-center gap-y-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-[325px] text-2xl bg-black text-white font-bold px-4 py-3 rounded-lg transition duration-300 ease-in-out transform lg:hover:-translate-y-1 lg:hover:scale-110 cursor-pointer flex items-center justify-center"
          >
            <Google className="mr-2 w-10 h-10" />
            Login with Google
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Login;
