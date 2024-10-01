import type { Metadata } from "next";
import "./globals.css";
import { PinbarProvider } from "@/providers/pinbar";
import { Navbar } from "@/components";

export const metadata: Metadata = {
  title: "TFT - Swap NFTS for NFTs",
  description:
    "TFT is for NFT lovers who'd rather swap than shop. Dive in, trade up, and grow your collection the fun way!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PinbarProvider>
          <div className="h-screen flex items-center justify-center flex-col">
            <Navbar />
            {children}
          </div>
        </PinbarProvider>
      </body>
    </html>
  );
}
