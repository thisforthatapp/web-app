"use client";

import { FC, useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import NFTComponent from "@/components/nft";

interface NFTPageProps {
  params: {
    chain: string;
    collection: string;
    tokenId: string;
  };
}

const NFTPage: FC<NFTPageProps> = ({ params }) => {
  const [nftInfo, setNftInfo] = useState<any | null>(null);

  const fetchNftInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("nfts")
        .select("*")
        .eq("chain_id", params.chain)
        .eq("collection_contract", params.collection)
        .eq("token_id", params.tokenId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setNftInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch offer info", error);
    }
  };

  useEffect(() => {
    if (params.chain && params.collection && params.tokenId) {
      fetchNftInfo();
    }
  }, [params]);

  console.log("nftInfo", nftInfo);

  if (!nftInfo) {
    return <div>Loading...</div>;
  }

  return <NFTComponent nft={nftInfo} />;
};

export default NFTPage;
