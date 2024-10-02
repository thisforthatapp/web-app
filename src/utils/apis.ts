import { Network, Alchemy } from "alchemy-sdk";

export async function getNFTsForWallet(
  chain: string,
  walletAddress: string,
  pageKey: string | null
): Promise<any> {
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(settings);

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
  const nfts = sortAndFilterNfts(nftsForOwner.ownedNfts);

  return {
    nfts,
    pageKey: nftsForOwner.pageKey === pageKey ? null : nftsForOwner.pageKey,
  };
}

export async function getCryptoPunksforWallet(
  walletAddress: string
): Promise<CryptoPunk[]> {
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

  if (data.result) {
    return data.result.map(convertCryptoPunkToNFT);
  }

  return [];
}

function sortAndFilterNfts(nftData: NFT[]): FilteredNFT[] {
  const getFloorPrice = (nft: NFT): number => {
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
    contract: {
      address: nft.contract.address,
      name: nft.contract.name,
      tokenType: nft.contract.tokenType,
    },
    image: nft.image.cachedUrl,
    thumbnail: nft.image.thumbnailUrl,
    name: nft.raw.metadata.name,
    tokenId: nft.tokenId,
    possible_spam: getFloorPrice(nft) === -Infinity,
  }));
}

function convertCryptoPunkToNFT(punk: CryptoPunk): FilteredNFT {
  const metadata = JSON.parse(punk.metadata);
  return {
    id: punk.token_address + "_" + punk.token_id,
    contract: {
      address: punk.token_address,
      name: punk.name,
      tokenType: punk.contract_type,
    },
    image: metadata.image,
    thumbnail: metadata.image,
    name: metadata.name,
    tokenId: punk.token_id,
    possible_spam: false,
  };
}
