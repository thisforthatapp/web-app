// TODO: Continue from here

import React, { useState, useEffect } from "react";
import { useAccount, useSignMessage /*useChains*/ } from "wagmi";
import { verifyMessage } from "viem";
import { supabase } from "@/utils/supabaseClient";
// import { Verified, ArrowLeft, ChevronRight } from "@/icons";

interface NFT {
  id: number;
  name: string;
  image: string;
  is_verified: boolean;
  wallet_address: string;
  chain: string;
}

interface WalletGroup {
  chain: string;
  wallet: string;
  nfts: NFT[];
}

interface VerifyNFTProps {
  onBack: () => void;
  onComplete: () => void;
}

const NftVerifier: React.FC<VerifyNFTProps> = ({ onBack, onComplete }) => {
  const { address } = useAccount();
  // const { chain } = useChains();

  const { signMessageAsync } = useSignMessage();

  const [walletGroups, setWalletGroups] = useState<WalletGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (address) {
      fetchNFTs();
    }
  }, [address]);

  const fetchNFTs = async () => {
    return;
    if (!address) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("nfts")
        .select("*")
        .or(
          `is_verified.eq.false,and(is_verified.eq.true,wallet_address.neq.${address})`
        );

      if (error) throw error;

      // Group NFTs by wallet and chain
      const groupedNFTs = data.reduce((acc: WalletGroup[], nft: NFT) => {
        const existingGroup = acc.find(
          (group) =>
            group.chain === nft.chain && group.wallet === nft.wallet_address
        );
        if (existingGroup) {
          existingGroup.nfts.push(nft);
        } else {
          acc.push({
            chain: nft.chain,
            wallet: nft.wallet_address,
            nfts: [nft],
          });
        }
        return acc;
      }, []);

      setWalletGroups(groupedNFTs);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (walletGroup: WalletGroup) => {
    return;
    if (!address || !chain) return;
    setVerifying(true);
    try {
      // Request wallet signature
      const message = `Verify ownership of ${walletGroup.nfts.length} NFTs on ${walletGroup.chain}`;
      const signature = await signMessageAsync({ message });

      // Verify signature (this should be done on the backend for security)
      const recoveredAddress = await verifyMessage({
        address: walletGroup.wallet,
        message,
        signature,
      });

      if (recoveredAddress.toLowerCase() !== walletGroup.wallet.toLowerCase()) {
        throw new Error("Signature verification failed");
      }

      // Update NFTs in the backend
      const { data, error } = await supabase.from("nfts").upsert(
        walletGroup.nfts.map((nft) => ({
          id: nft.id,
          is_verified: true,
          wallet_address: address,
        }))
      );

      if (error) throw error;

      // Update local state
      setWalletGroups((prev) =>
        prev.map((group) =>
          group.chain === walletGroup.chain &&
          group.wallet === walletGroup.wallet
            ? {
                ...group,
                nfts: group.nfts.map((nft) => ({ ...nft, is_verified: true })),
              }
            : group
        )
      );
    } catch (error) {
      console.error("Verification failed:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        {/* <ArrowLeft className="w-4 h-4 mr-2" /> */}
        Back
      </button>
      <h2 className="text-2xl font-bold mb-6">Verify your NFTs</h2>
      {walletGroups.map((group, index) => (
        <div key={index} className="mb-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-semibold">{group.chain}</p>
              <p className="text-sm text-gray-600">{group.wallet}</p>
            </div>
            <p className="text-sm">{group.nfts.length} NFTs</p>
          </div>
          <button
            onClick={() => handleVerify(group)}
            disabled={verifying}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex justify-center items-center"
          >
            {verifying ? (
              "Verifying..."
            ) : (
              <>
                Verify
                {/* <ChevronRight className="w-4 h-4 ml-2" /> */}
              </>
            )}
          </button>
        </div>
      ))}
      {walletGroups.length === 0 && (
        <p className="text-center text-gray-600">No NFTs to verify</p>
      )}
    </div>
  );
};

export default NftVerifier;
