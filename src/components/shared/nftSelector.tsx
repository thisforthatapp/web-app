import { FC, useState } from "react";
import { getNFTsForWallet, getCryptoPunksforWallet } from "@/utils/apis";
import { Search } from "@/icons";

const NftSelector: FC<{
  selectedNfts: any;
  setSelectedNfts: any;
}> = ({ selectedNfts, setSelectedNfts }) => {
  const [currentWallet, setCurrentWallet] = useState<string>("");
  const [currentChain, setCurrentChain] = useState<string>("ethereum");

  const [nfts, setNfts] = useState<any[]>([]);
  // const [selectedNfts, setSelectedNfts] = useState<any[]>([]);
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);

  const handleFetch = async () => {
    if (nextPageKey === null && currentChain === "ethereum") {
      const [punks, results] = await Promise.all([
        getCryptoPunksforWallet(currentWallet),
        getNFTsForWallet(currentChain, currentWallet, nextPageKey),
      ]);
      setNfts([...punks, ...results.nfts]);
      setNextPageKey(results.pageKey);
    } else {
      const results = await getNFTsForWallet(
        currentChain,
        currentWallet,
        nextPageKey
      );
      setNfts([...nfts, ...results.nfts]);
      setNextPageKey(results.pageKey);
    }
  };

  const toggleNftSelection = (nft: any) => {
    setSelectedNfts((prev) =>
      prev.some((item) => item.id === nft.id)
        ? prev.filter((item) => !(item.id === nft.id))
        : [...prev, nft]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-3 p-4">
        <input
          type="text"
          placeholder="Wallet address"
          value={currentWallet}
          onChange={(e) => setCurrentWallet(e.target.value)}
          className="flex-grow px-3 py-2 border rounded text-sm"
        />
        <select
          value={currentChain}
          onChange={(e) => setCurrentChain(e.target.value)}
          className="w-28 p-2 border rounded text-sm"
        >
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
          <option value="solana">Solana</option>
        </select>
        <button
          onClick={handleFetch}
          className="p-2 bg-gray-900 text-white rounded"
        >
          <Search className="text-white w-5" />
        </button>
      </div>

      <div className="px-2 h-full flex overflow-y-auto hide-scrollbar min-h-[250px]">
        {nfts.length > 0 && (
          <div className="grid grid-cols-4 gap-4 p-2">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className={`relative border p-1 rounded cursor-pointer ${
                  selectedNfts.some((item) => item.id === nft.id)
                    ? "ring-4 ring-indigo-500"
                    : "hover:shadow-md"
                }`}
                onClick={() => toggleNftSelection(nft)}
              >
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
        )}
        {nextPageKey && (
          <button
            onClick={handleFetch}
            className="mt-auto w-full py-2 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default NftSelector;
