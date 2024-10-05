"use client";

import { useState } from "react";
import { Footer } from "@/components";
import { Grid, ActivityFeed } from "@/components/home";
import { useIsMobile } from "@/hooks";
import { Image as ImageIcon, Activity } from "@/icons";

export default function Home() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("grid");

  const MobileFooterTab = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16">
      <button
        className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 ${
          activeTab === "grid"
            ? "bg-gray-100 font-semibold"
            : "bg-white font-medium"
        }`}
        onClick={() => setActiveTab("grid")}
      >
        <ImageIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Browse NFTs</span>
      </button>
      <button
        className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 ${
          activeTab === "feed"
            ? "bg-gray-100 font-semibold"
            : "bg-white font-medium"
        }`}
        onClick={() => setActiveTab("feed")}
      >
        <Activity className="w-5 h-5" />
        <span className="text-sm font-medium">Latest Activity</span>
      </button>
    </div>
  );

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <div
        className={`w-full relative bg-[#f9f9f9] flex ${
          !isMobile ? "mb-[50px]" : "mb-14"
        }`}
      >
        {(!isMobile || activeTab === "grid") && <Grid />}
        {(!isMobile || activeTab === "feed") && (
          <ActivityFeed showCollapsibleTab={!isMobile} />
        )}
      </div>
      {!isMobile && <Footer />}
      {isMobile && <MobileFooterTab />}
    </div>
  );
}
