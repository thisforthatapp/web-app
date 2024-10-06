import React, { useState, useEffect } from "react";
import { useSignMessage } from "wagmi";
import { supabase } from "@/utils/supabaseClient";
import { CHAIN_IDS_TO_CHAINS } from "@/utils/constants";
import { verifyNFTs } from "@/utils/helpers";

interface VerifyNFTProps {
  onComplete: () => void;
}

const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const NFTVerificationRow = ({ group, nftCount, onVerify }) => {
  const [chain, wallet] = group.split("-");

  return (
    <div className="p-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex flex-col">
        <div className="flex mb-1">
          <div className="font-semibold">Chain: </div>
          <div className="ml-2">{CHAIN_IDS_TO_CHAINS[chain]}</div>
        </div>
        <div className="flex mb-1">
          <div className="font-semibold">Wallet: </div>
          <div className="flex items-center ml-2">
            <div className="mr-2">
              {wallet.slice(0, 8)}...{wallet.slice(-6)}
            </div>{" "}
            <button className="mb-1">
              <ExternalLinkIcon />
            </button>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="font-semibold">NFTs to verify: </div>
          <div className="ml-2">{nftCount}</div>
        </div>
      </div>
      <button
        onClick={() => onVerify(group)}
        className={`px-4 py-2 rounded-lg text-white font-medium flex items-center transition-colors duration-200 bg-blue-600 hover:bg-blue-700`}
      >
        <>
          Verify
          <span className="ml-1">
            <ChevronRightIcon />
          </span>
        </>
      </button>
    </div>
  );
};

const NftVerifier: React.FC<VerifyNFTProps> = ({ onComplete }) => {
  const { signMessageAsync } = useSignMessage();

  const [walletGroups, setWalletGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayMaxWarning, setDisplayMaxWarning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerrifyError] = useState<string | null>(null);
  const [verifiedWalletGroups, setVerifiedWalletGroups] = useState<any[]>([]);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    setLoading(true);

    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id;
      if (!userId) throw new Error("User session not found");

      const { data, error } = await supabase
        .from("user_nfts")
        .select(`id, user_id, nft_id, nfts!inner (*)`)
        .eq("user_id", userId)
        .eq("nfts.is_verified", false);

      console.log("data", data);
      if (error) throw error;

      // Group the NFTs by chain_id and wallet_address
      const groupedNfts = data.reduce((acc, item) => {
        const key = `${item.nfts.chain_id}-${item.nfts.wallet_address}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item.nfts);

        if (acc[key].length > 50) {
          setDisplayMaxWarning(true);
        }

        return acc;
      }, {});

      console.log("groupedNfts", groupedNfts);

      setWalletGroups(groupedNfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (walletGroup: any) => {
    setVerifying(true);

    try {
      // Request wallet signature
      const [chain, wallet] = walletGroup.split("-");

      const message = `Verify ownership of NFTs for wallet ${wallet} on ${CHAIN_IDS_TO_CHAINS[chain]}`;
      const signature = await signMessageAsync({ message });
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      const response = await verifyNFTs(wallet, chain, signature, token);

      // if response.error is not null, set verify error, else, set the walletgroup as done verifying
      if (response.error) {
        setVerrifyError(response.error);
      } else {
        setVerifiedWalletGroups((prev) => [...prev, walletGroup]);
      }
    } catch (error) {
      setVerrifyError(error);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center">
        <div className="loader-large" />
        <div className="mt-4">Loading NFTs from your account...</div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-[350px] flex flex-col w-full h-full overflow-hidden ${
          verifying ? "items-center justify-center" : ""
        }`}
      >
        {verifyError && (
          <>
            {verifyError === "Verification failed" ? (
              <div className="text-red-600">
                Verification failed. Please make sure your chain and wallet
                match the one indicated and try again.
              </div>
            ) : (
              <div className="text-red-600">
                Error verifying NFTs. Please try again.
              </div>
            )}
            <button
              onClick={() => setVerrifyError(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Go back
            </button>
          </>
        )}
        {!verifyError && (
          <>
            {verifying && (
              <>
                <div className="loader-large" />
                <div className="mt-4">Verifying NFTs</div>
              </>
            )}
            {!verifying && (
              <>
                {Object.keys(walletGroups).length === 0 && (
                  <div>No NFTS to verify</div>
                )}
                {Object.keys(walletGroups).length > 0 && (
                  <div>
                    {displayMaxWarning && (
                      <div className="py-2 bg-yellow-100 text-yellow-800 text-center">
                        <p className="text-sm">
                          Max 50 NFTs will be verified per signature.
                        </p>
                      </div>
                    )}
                    {Object.keys(walletGroups).map((group, index) => (
                      <NFTVerificationRow
                        key={group}
                        group={group}
                        nftCount={walletGroups[group].length}
                        onVerify={handleVerify}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default NftVerifier;
