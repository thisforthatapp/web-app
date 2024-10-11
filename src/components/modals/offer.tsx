"use client";

import { FC, useEffect, useState } from "react";
import Modal from "react-modal";
import { useAuth } from "@/providers/authProvider";
import { useIsMobile } from "@/hooks";
import { getModalStyles } from "@/styles";
import { Main, Select, Transaction } from "@/components/offer";
import { NFTFeedItem } from "@/types/supabase";
import { supabase } from "@/utils/supabaseClient";

interface BaseProps {
  closeModal: () => void;
}

interface MakeOfferProps extends BaseProps {
  type: "make_offer";
  initialNFT: NFTFeedItem;
  offerId: null;
}

interface ViewOfferProps extends BaseProps {
  type: "view_offer";
  initialNFT: null;
  offerId: string;
}

interface TransactionProps extends BaseProps {
  type: "transaction";
  initialNFT: null;
  offerId?: string;
}

type Props = MakeOfferProps | ViewOfferProps | TransactionProps;

const Offer: FC<Props> = ({
  type,
  offerId = null,
  initialNFT = null,
  closeModal,
}) => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const customStyles = getModalStyles(isMobile);

  const [view, setView] = useState<"main" | "select" | "transaction" | null>(
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

    console.log("Accepted!");
  };

  const counterOffer = async () => {
    console.log("Counter offering...");
    // present choice screen
    setView("select");
  };

  console.log("offerInfo", offerInfo);

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
            counterOffer={counterOffer}
            closeModal={closeModal}
          />
        )}
        {view === "select" && (
          <Select
            type={type === "make_offer" ? "initial_offer" : "counter_offer"}
            offerId={offerId}
            userA={
              type === "make_offer"
                ? {
                    id: profile?.id,
                    username: profile?.username,
                    profile_pic_url: profile?.profile_pic_url,
                  }
                : {
                    id: offerInfo.user?.id,
                    username: offerInfo.user?.username,
                    profile_pic_url: offerInfo.user?.profile_pic_url,
                  }
            }
            userB={
              type === "make_offer"
                ? {
                    id: initialNFT?.nft_user_id,
                    username: initialNFT?.nft_user_id_username,
                    profile_pic_url: initialNFT?.nft_user_id_profile_pic_url,
                  }
                : {
                    id: offerInfo.counter_user?.id,
                    username: offerInfo.counter_user?.username,
                    profile_pic_url: offerInfo.counter_user?.profile_pic_url,
                  }
            }
            initUserAItems={type === "make_offer" ? [] : offerInfo.offer.user}
            initUserBItems={
              type === "make_offer"
                ? [
                    {
                      id: initialNFT?.nft_id ?? "",
                      name: initialNFT?.nft_name ?? "",
                      image: initialNFT?.nft_image ?? "",
                      chaind_id: initialNFT?.nft_chain_id ?? "",
                      collection_contract:
                        initialNFT?.nft_collection_contract ?? "",
                      token_id: initialNFT?.nft_token_id ?? "",
                      token_type: initialNFT?.nft_token_type ?? "",
                    },
                  ]
                : offerInfo.offer.userCounter
            }
          />
        )}
        {view === "transaction" && <Transaction info={offerInfo} />}
      </Modal>
    </div>
  );
};

export default Offer;
