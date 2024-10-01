"use client";

import { Footer } from "@/components";
import { Grid, ActivityFeed } from "@/components/home";

export default function Home() {
  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <div className="w-full mb-[50px] relative bg-[#f9f9f9] flex">
        <Grid />
        <ActivityFeed />
      </div>
      <Footer />
    </div>
  );
}
