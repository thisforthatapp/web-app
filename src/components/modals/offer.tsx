"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useIsMobile } from "@/hooks";
import { getModalStyles } from "@/styles";
import { Main, Select, Transaction } from "@/components/offer";
import { NFT, Profile } from "@/types/supabase";

interface Props {
  type: "make_offer" | "view_offer";
  initialDetails?: { nft: NFT; user: Profile } | null;
  closeModal: () => void;
}

const Offer: React.FC<Props> = ({
  type,
  initialDetails = null,
  closeModal,
}) => {
  const isMobile = useIsMobile();
  const customStyles = getModalStyles(isMobile);

  const [view, setView] = useState<"main" | "select" | "transaction" | null>(
    type === "make_offer" ? "select" : "main"
  );

  return (
    <div>
      <Modal
        id="react-modal"
        ariaHideApp={false}
        isOpen={true}
        onRequestClose={closeModal}
        style={customStyles}
      >
        {view === "main" && <Main />}
        {view === "select" && <Select />}
        {view === "transaction" && <Transaction />}
      </Modal>
    </div>
  );
};

export default Offer;
