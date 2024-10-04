import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components";
import { PinbarProvider } from "@/providers/pinbarProvider";
import { Web3Provider } from "@/providers/web3Provider";
import { AuthProvider } from "@/providers/authProvider";

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
          <AuthProvider>
            <PinbarProvider>
              <div className="h-screen flex items-center justify-center flex-col">
                <Navbar />
                {children}
              </div>
            </PinbarProvider>
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
