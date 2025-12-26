"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import AppShell from "@/components/AppShell";

type TitleTier = { min: number; title: string };

const TITLE_POOL: TitleTier[] = [
  { min: 0, title: "First Walk" },
  { min: 5, title: "Rising Presence" },
  { min: 10, title: "Runway Guardian" },
  { min: 15, title: "Mami of GL" }
];

function getStoredNumber(key: string, fallback = 0) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  const n = raw ? Number(raw) : fallback;
  return Number.isFinite(n) ? n : fallback;
}

function getTitle(caught: number) {
  let result = TITLE_POOL[0].title;
  for (const t of TITLE_POOL) {
    if (caught >= t.min) result = t.title;
  }
  return result;
}

export default function EndPage() {
  const [score, setScore] = React.useState(0);
  const [caught, setCaught] = React.useState(0);
  const [cards, setCards] = React.useState(0);

  React.useEffect(() => {
    const s = getStoredNumber("mamiLastScore", 0);
    const c = getStoredNumber("mamiLastCaught", 0);
    const k = getStoredNumber("mamiCardsCollected", 0);

    setScore(s);
    setCaught(c);
    setCards(k);

    const best = getStoredNumber("mamiBestScore", 0);
    if (s > best) window.localStorage.setItem("mamiBestScore", String(s));
  }, []);

  const titleEarned = getTitle(caught);
  const shareText = `I played Mami of GL and earned the title ${titleEarned}`;

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mami of GL", text: shareText });
      } catch {
        // user cancelled
      }
    } else {
      window.alert(shareText);
    }
  };

  return (
    <AppShell activeTab="play">
      <main className="page">
      <header className="header">
        <h1 className="title">Run Complete</h1>
        <p className="subtitle">You owned the moment</p>
      </header>

      <section className="hero">
        <div className="sonyaPlaceholder" aria-label="Sonya illustration placeholder">
          Sonya
          <div className="hint">Illustration here</div>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <span className="label">Score</span>
          <span className="value">{score}</span>
        </div>

        <div className="stat">
          <span className="label">Actresses caught</span>
          <span className="value">{caught}</span>
        </div>

        <div className="stat">
          <span className="label">Cards collected</span>
          <span className="value">{cards}</span>
        </div>
      </section>

      <section className="titleBlock">
        <p className="titleLabel">Title earned</p>
        <p className="earned">{titleEarned}</p>
      </section>

      <section className="actions">
        <Link href="/play" className="btnPrimary">
          Play Again
        </Link>

        <Link href="/collection" className="btnSecondary">
          View Collection
        </Link>

        <button type="button" className="share" onClick={onShare}>
          Share Result
        </button>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: transparent;
          padding-bottom: 76px;
          color: #1e1e1e;
        }

        .header {
          padding: 24px 16px 12px;
          text-align: center;
        }

        .title {
          margin: 0;
          font-size: 26px;
          font-weight: 900;
        }

        .subtitle {
          margin-top: 6px;
          font-size: 14px;
          opacity: 0.8;
        }

        .hero {
          padding: 12px 16px;
          display: flex;
          justify-content: center;
        }

        .sonyaPlaceholder {
  width: 220px;
  height: 280px;
  border-radius: 18px;
  background: radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.16), rgba(255, 255, 255, 0.78) 55%, rgba(255, 255, 255, 0.62));
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
}

.imgWrap {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 10px;
}

.imgGlow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 55% 30%, rgba(212, 175, 55, 0.22), transparent 58%);
  opacity: 0.8;
}


        .stats {
          padding: 12px 16px;
          max-width: 520px;
          margin: 0 auto;
          display: grid;
          gap: 10px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-weight: 900;
        }

        .label {
          font-size: 13px;
          opacity: 0.8;
        }

        .value {
          font-size: 15px;
        }

        .titleBlock {
          text-align: center;
          padding: 14px 16px 6px;
        }

        .titleLabel {
          margin: 0;
          font-size: 12px;
          opacity: 0.7;
          font-weight: 900;
        }

        .earned {
          margin-top: 4px;
          font-size: 20px;
          font-weight: 900;
        }

        .actions {
          padding: 12px 16px 20px;
          display: grid;
          gap: 10px;
          max-width: 520px;
          margin: 0 auto;
        }

        .btnPrimary,
        .btnSecondary {
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          text-decoration: none;
          border: 1px solid rgba(0, 0, 0, 0.12);
          color: #1e1e1e;
        }

        .btnPrimary {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.07);
        }

        .btnSecondary {
          background: rgba(255, 255, 255, 0.6);
        }

        .share {
          background: none;
          border: none;
          font-weight: 900;
          opacity: 0.85;
          padding: 8px;
        }

        .bottomNav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 64px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          padding: 10px 12px;
          background: rgba(250, 247, 241, 0.92);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .navItem {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 900;
          color: #1e1e1e;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        @media (min-width: 900px) {
          .title {
            font-size: 32px;
          }

          .bottomNav {
            max-width: 520px;
            left: 50%;
            transform: translateX(-50%);
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-bottom: none;
            border-top-left-radius: 18px;
            border-top-right-radius: 18px;
          }
        }
      `}</style>
    </main>
      </main>
    </AppShell>
  );
}
