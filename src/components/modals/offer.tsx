"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useIsMobile } from "@/hooks";
import { getModalStyles } from "@/styles";
import { Main, Select, Transaction } from "@/components/offer";
import { NFTFeedItem } from "@/types/supabase";
import { supabase } from "@/utils/supabaseClient";

interface Props {
  type: "make_offer" | "view_offer" | "transaction";
  offerId?: string | null;
  initialNFT?: NFTFeedItem | null;
  closeModal: () => void;
}

const Offer: React.FC<Props> = ({
  type,
  offerId = null,
  initialNFT = null,
  closeModal,
}) => {
  const isMobile = useIsMobile();
  const customStyles = getModalStyles(isMobile);

  const [view] = useState<"main" | "select" | "transaction" | null>(
    type === "make_offer"
      ? "select"
      : type === "view_offer"
      ? "main"
      : "transaction"
  );
  const [offerInfo, setOfferInfo] = useState<any | null>(null);

  const fetchOfferInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("user_offers")
        .select(
          "*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*)"
        )
        .eq("id", offerId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setOfferInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch offer info", error);
    }
  };

  useEffect(() => {
    if (offerId) {
      fetchOfferInfo();
    }
  }, [offerId]);

  const acceptOffer = async () => {
    console.log("Accepting offer...");

    const { data } = await supabase
      .from("user_offers")
      .update({
        status: "accepted",
        updated_at: new Date(),
      })
      .eq("id", offerId);
  };

  const counterOffer = async () => {
    console.log("Counter offering...");
    // present choice screen
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
        {view === "main" && (
          <Main
            offerId={offerId!}
            info={offerInfo}
            acceptOffer={acceptOffer}
            counterOffer={() => {}}
            closeModal={closeModal}
          />
        )}
        {view === "select" && <Select initialNFT={initialNFT!} />}
        {view === "transaction" && <Transaction info={offerInfo} />}
      </Modal>
    </div>
  );
};

export default Offer;
