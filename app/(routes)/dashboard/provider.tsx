"use client";
import AppHeader from "@/app/_components/AppHeader";
import React from "react";

function Dashboardprovider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />

      <div className="px-10 md:px-28 lg:px-36 xl:px-48">{children}</div>
    </>
  );
}

export default Dashboardprovider;
