import { Network, Alchemy } from "alchemy-sdk";
import { NFT } from "@/types/supabase";
import { ALCHEMY_CHAIN_SLUGS, CHAIND_TO_CHAIN_IDS } from "@/utils/constants";

export async function getNFTsForWallet(
  chain: string,
  walletAddress: string,
  pageKey: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    network: ALCHEMY_CHAIN_SLUGS[
      chain as keyof typeof ALCHEMY_CHAIN_SLUGS
    ] as Network,
  };
  const chainId =
    CHAIND_TO_CHAIN_IDS[chain as keyof typeof CHAIND_TO_CHAIN_IDS];
  const alchemy = new Alchemy(settings);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: any = {
    pageSize: 100,
  };

  if (pageKey) {
    options = { ...options, pageKey };
  }

  const nftsForOwner = await alchemy.nft.getNftsForOwner(
    walletAddress,
    options
  );
  console.log("nftsForOwner", nftsForOwner);

  const nfts = sortAndFilterNfts(
    nftsForOwner.ownedNfts,
    chainId,
    walletAddress
  );

  return {
    nfts,
    pageKey: nftsForOwner.pageKey === pageKey ? null : nftsForOwner.pageKey,
  };
}

export async function getCryptoPunksforWallet(
  chain: string,
  walletAddress: string
): Promise<NFT[]> {
  const chainId =
    CHAIND_TO_CHAIN_IDS[chain as keyof typeof CHAIND_TO_CHAIN_IDS];
  const url = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft`;
  const params = new URLSearchParams({
    chain: "eth",
    format: "decimal",
    limit: "100",
    "token_addresses[0]": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
    media_items: "false",
  });

  const response = await fetch(`${url}?${params}`, {
    headers: {
      accept: "application/json",
      "X-API-Key":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImI5MzFhODZhLTE0YzEtNDEyMy1hMGM1LTk3ZTI0MDFhYzEzNyIsIm9yZ0lkIjoiNDEwMjIxIiwidXNlcklkIjoiNDIxNTU0IiwidHlwZUlkIjoiOGU0YjZiNTYtYjIxYi00MGJhLWE1M2UtNDgzOTcyMWQyN2RjIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Mjc4NzE0OTUsImV4cCI6NDg4MzYzMTQ5NX0.4VLJBsmH8oeKCNWc1lbGkuy-ChtbmPjr7EahawwYfXg",
    },
  });

  const data = await response.json();
  console.log("punks", data);

  if (data.result) {
    return data.result.map((punk) =>
      convertCryptoPunkToNFT(punk, chainId, walletAddress)
    );
  }

  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortAndFilterNfts(
  nftData: any[],
  chainId: number,
  walletAddress: string
): any[] {
  const getFloorPrice = (nft: any): number => {
    try {
      const floorPrice = nft.contract.openSeaMetadata?.floorPrice;
      return floorPrice ? floorPrice : -Infinity;
    } catch {
      return -Infinity;
    }
  };

  const sortedNfts = [...nftData].sort(
    (a, b) => getFloorPrice(b) - getFloorPrice(a)
  );

  return sortedNfts.map((nft) => ({
    id: nft.contract.address + "_" + nft.tokenId,
    name: nft.raw.metadata.name,
    chain_id: chainId,
    collection_contract: nft.contract.address,
    collection_name: nft.contract.name,
    token_type: nft.tokenType,
    token_id: nft.tokenId,
    token_uri: nft.tokenUri,
    image: nft.image.cachedUrl,
    thumbnail: nft.image.thumbnailUrl,
    possible_spam: getFloorPrice(nft) === -Infinity,
    wallet_address: walletAddress,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertCryptoPunkToNFT(
  punk: any,
  chainId: number,
  walletAddress: string
): NFT {
  const metadata = JSON.parse(punk.metadata);
  return {
    id: punk.token_address + "_" + punk.token_id,
    name: metadata.name,
    chain_id: chainId,
    collection_contract: punk.token_address,
    collection_name: punk.name,
    token_type: "CryptoPunk",
    token_id: punk.token_id,
    token_uri: punk.metadata,
    image: metadata.image,
    thumbnail: metadata.image,
    possible_spam: false,
    wallet_address: walletAddress,
  };
}
