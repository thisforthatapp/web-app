import type { Metadata } from "next";
import "./globals.css";
import { PinbarProvider } from "@/providers/pinbar";
import { Navbar } from "@/components";
import { Web3Provider } from "@/providers/web3Provider";

export const metadata: Metadata = {
  title: "TFT - Swap NFTS for NFTs",
  description:
    "Where NFT enthusiasts swap, trade, and connect. Why sell when you can have fun building your collection?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <PinbarProvider>
            <div className="h-screen flex items-center justify-center flex-col">
              <Navbar />
              {children}
            </div>
          </PinbarProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
