"use client";

import React, { useState } from "react";
import Modal from "react-modal";
import { useIsMobile } from "@/hooks";
import { getModalStyles } from "@/styles";
import { Close, Add, Handshake, Verified } from "@/icons";
import { NftSelector, NftVerifier } from "@/components/shared";
interface Props {
  closeModal: () => void;
}

const Wallet: React.FC<Props> = ({ closeModal }) => {
  const isMobile = useIsMobile();
  const customStyles = getModalStyles(isMobile);

  const [action, setAction] = useState<"add" | "verify" | "offer" | null>(null);

  const handleActionSelect = (action: "add" | "verify" | "offer") => {
    setAction(action);
  };

  return (
    <div>
      <Modal
        id="react-modal"
        ariaHideApp={false}
        isOpen={true}
        onRequestClose={closeModal}
        style={customStyles}
      >
        {action === null && (
          <>
            <div
              className="absolute top-0 right-0 w-[75px] h-[75px] flex items-center justify-center cursor-pointer"
              onClick={closeModal}
            >
              <Close width="32" height="32" />
            </div>
            <div className="w-full mx-auto p-6">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Choose an action
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleActionSelect("add")}
                  className="h-[150px] flex flex-col items-center justify-between p-6 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-200"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <Add className="w-12 h-12 text-blue-600" />
                  </div>
                  <span className="font-semibold text-center mt-3">
                    Add NFTs
                  </span>
                </button>
                <button
                  onClick={() => handleActionSelect("verify")}
                  className="h-[150px] flex flex-col items-center justify-between p-6 bg-green-100 rounded-lg hover:bg-green-200 transition duration-200"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <Verified
                      useAsIcon={true}
                      className="w-16 h-16 text-green-600"
                    />
                  </div>
                  <span className="font-semibold text-center mt-3">
                    Verify NFTs
                  </span>
                </button>
                <button
                  onClick={() => handleActionSelect("offer")}
                  className="h-[150px] flex flex-col items-center justify-between p-6 bg-purple-100 rounded-lg hover:bg-purple-200 transition duration-200"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <Handshake className="w-12 h-12 text-purple-600" />
                  </div>
                  <span className="font-semibold text-center mt-3">
                    Make Offer
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
        {action !== null && (
          <>
            {action === "add" && (
              <>
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                  <div className="text-xl font-semibold">Add Your NFTs</div>
                  <div className="cursor-pointer" onClick={closeModal}>
                    <Close className="w-8 h-8" />
                  </div>
                </div>
                <NftSelector
                  displaySkipOption={false}
                  onComplete={closeModal}
                />
              </>
            )}
            {action === "verify" && (
              <>
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                  <div className="text-xl font-semibold">Verify NFTs</div>
                  <div className="cursor-pointer" onClick={closeModal}>
                    <Close className="w-8 h-8" />
                  </div>
                </div>
                <NftVerifier onComplete={closeModal} />
              </>
            )}
            {action === "offer" && <></>}
          </>
        )}
      </Modal>
    </div>
  );
};

export default Wallet;
