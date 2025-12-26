"use client";

import Link from "next/link";
import React from "react";

type Tab = "home" | "play" | "cards";

export default function AppShell({
  children,
  activeTab
}: {
  children: React.ReactNode;
  activeTab: Tab;
}) {
  return (
    <div className="appFrame">
      <div className="appCard">{children}</div>

      <nav className="bottomNav" aria-label="Bottom navigation">
        <Link className={"navItem" + (activeTab === "home" ? " navActive" : "")} href="/">
          Home
        </Link>
        <Link className={"navItem" + (activeTab === "play" ? " navActive" : "")} href="/play">
          Play
        </Link>
        <Link className={"navItem" + (activeTab === "cards" ? " navActive" : "")} href="/collection">
          Cards
        </Link>
      </nav>
    </div>
  );
}
