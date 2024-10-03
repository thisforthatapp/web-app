import { FC, useState } from "react";
import { getNFTsForWallet, getCryptoPunksforWallet } from "@/utils/apis";
import { useEnsAddress } from "wagmi";
import { isAddress } from "viem";
import { Search, Wallet } from "@/icons";
import { NFT } from "@/types/supabase";
import { SUPPORTED_CHAINS, CHAIN_LABELS } from "@/utils/constants";

const NftSelector: FC<{
  selectedNfts: NFT[];
  setSelectedNfts: React.Dispatch<React.SetStateAction<NFT[]>>;
}> = ({ selectedNfts, setSelectedNfts }) => {
  const [currentWallet, setCurrentWallet] = useState<string>("");
  const [currentChain, setCurrentChain] = useState<string>("ethereum");
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { data: ensAddress, isLoading: isResolvingEns } = useEnsAddress({
    name: currentWallet,
    query: {
      enabled: currentWallet.endsWith(".eth"),
    },
  });

  const resolveAddress = (): string => {
    if (isAddress(currentWallet)) {
      return currentWallet;
    }
    if (ensAddress) {
      return ensAddress;
    }
    throw new Error("Invalid address or unresolved ENS name");
  };

  const handleFetch = async (isInitialSearch: boolean = false) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const walletAddress = resolveAddress();

      if (isInitialSearch) {
        setNfts([]);
        setNextPageKey(null);
      }

      if (nextPageKey === null && currentChain === "ethereum") {
        const [punks, results] = await Promise.all([
          getCryptoPunksforWallet(currentChain, walletAddress),
          getNFTsForWallet(currentChain, walletAddress, nextPageKey),
        ]);
        setNfts([...punks, ...results.nfts]);
        setNextPageKey(results.pageKey);
      } else {
        const results = await getNFTsForWallet(
          currentChain,
          walletAddress,
          nextPageKey
        );
        setNfts((prev) => [...prev, ...results.nfts]);
        setNextPageKey(results.pageKey);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    handleFetch(true);
  };

  const handleLoadMore = () => {
    handleFetch(false);
  };

  const toggleNftSelection = (nft: NFT) => {
    setSelectedNfts((prev) =>
      prev.some((item) => item.id === nft.id)
        ? prev.filter((item) => item.id !== nft.id)
        : [...prev, nft]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-3 p-4">
        <input
          type="text"
          placeholder="Wallet or ENS address"
          value={currentWallet}
          onChange={(e) => setCurrentWallet(e.target.value)}
          className="flex-grow px-3 py-2 border rounded text-sm"
        />
        <select
          value={currentChain}
          onChange={(e) => setCurrentChain(e.target.value)}
          className="w-28 p-2 border rounded text-sm"
        >
          {SUPPORTED_CHAINS.filter((chain) => chain !== currentChain).map(
            (chain) => (
              <option key={chain} value={chain}>
                {CHAIN_LABELS[chain as keyof typeof CHAIN_LABELS]}
              </option>
            )
          )}
        </select>
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded"
          disabled={isLoading || isResolvingEns}
        >
          <Search className="text-white w-5" />
        </button>
      </div>

      <div className="px-2 flex flex-col items-center justify-center min-h-[350px] bg-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="loader"></div>
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-600 px-20">
            <Wallet className="w-12 h-12" />
            <div className="mt-4 text-center">
              Enter a wallet or ENS address and click search to view NFTs
            </div>
          </div>
        ) : nfts.length > 0 ? (
          <div className="w-full flex flex-col min-h-0">
            <div className="grid grid-cols-4 gap-4 p-2 overflow-y-auto hide-scrollbar min-h-0 flex-grow">
              {nfts.map((nft) => (
                <div
                  key={nft.id}
                  className={`relative border p-1 rounded cursor-pointer ${
                    selectedNfts.some((item) => item.id === nft.id)
                      ? "ring-4 ring-black"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => toggleNftSelection(nft)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-auto rounded"
                  />
                  <div className="text-xs text-center mt-2 mb-2 line-clamp-2 mx-2">
                    {nft.name}
                  </div>
                  {nft.possible_spam && (
                    <div className="absolute top-2 left-2 right-2 bg-red-500 text-center text-xs text-white">
                      potential spam
                    </div>
                  )}
                </div>
              ))}
            </div>
            {nextPageKey && (
              <button
                onClick={handleLoadMore}
                className="mt-auto w-full py-2 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                disabled={isLoading || isResolvingEns}
              >
                Load More
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            No NFTs found for this wallet
          </div>
        )}
      </div>
    </div>
  );
};

export default NftSelector;
