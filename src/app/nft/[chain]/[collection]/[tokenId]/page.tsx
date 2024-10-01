import { FC } from "react";
import NFTComponent from "@/components/nft";

interface NFTPageProps {
  params: {
    tokenId: string;
  };
}

const NFTPage: FC<NFTPageProps> = ({ params }) => {
  console.log(params);

  return <NFTComponent />;
};

export default NFTPage;
