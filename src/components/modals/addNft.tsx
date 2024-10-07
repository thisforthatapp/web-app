"use client";

import { FC } from "react";
import Modal from "react-modal";
import { useIsMobile } from "@/hooks";
import { getModalStyles } from "@/styles";
import { Close } from "@/icons";
import { NftSelector } from "@/components/shared";
interface Props {
  closeModal: () => void;
}

const AddNft: FC<Props> = ({ closeModal }) => {
  const isMobile = useIsMobile();
  const customStyles = getModalStyles(isMobile);

  return (
    <div>
      <Modal
        id="react-modal"
        ariaHideApp={false}
        isOpen={true}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div className="text-xl font-semibold">Add Your NFTs</div>
          <div className="cursor-pointer" onClick={closeModal}>
            <Close className="w-8 h-8" />
          </div>
        </div>
        <NftSelector displaySkipOption={false} onComplete={closeModal} />
      </Modal>
    </div>
  );
};

export default AddNft;
