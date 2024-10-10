"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import NFTComponent from "@/components/nft";
import { Offer } from "@/components/modals";

interface NFTPageProps {
  params: {
    tokenId: string;
  };
}

const NFTPage: FC<NFTPageProps> = ({ params }) => {
  const router = useRouter();
  console.log(params);

  return (
    <>
      <NFTComponent />
      {/* <Offer
        type="view_offer"
        offerId="1"
        closeModal={() => {
          router.push("/nft/1/1/1");
        }}
      /> */}
    </>
  );
};

export default NFTPage;
