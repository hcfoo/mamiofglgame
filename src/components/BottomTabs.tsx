"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
};

function IconHome(active: boolean) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.6 12 3l9 7.6V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity={active ? 1 : 0.7}
      />
    </svg>
  );
}

function IconStar(active: boolean) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.2 1 6-5.2-2.8-5.2 2.8 1-6-4.3-4.2 5.9-.9L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity={active ? 1 : 0.7}
      />
    </svg>
  );
}

function IconCards(active: boolean) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7h10a2 2 0 0 1 2 2v11H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity={active ? 1 : 0.7}
      />
      <path
        d="M17 7V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity={active ? 1 : 0.45}
      />
    </svg>
  );
}

const tabs: Tab[] = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/play", label: "Play", icon: IconStar },
  { href: "/collection", label: "Cards", icon: IconCards },
];

export default function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav className="navBar" aria-label="Bottom navigation">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`navItem ${active ? "navItemActive" : ""}`}
          >
            {t.icon(active)}
            <span className="navLabel">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
