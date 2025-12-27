"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

type Tone = "cute" | "savage";

function getStoredTone(): Tone {
  if (typeof window === "undefined") return "cute";
  const v = window.localStorage.getItem("mamiTone");
  return v === "savage" ? "savage" : "cute";
}

function setStoredTone(tone: Tone) {
  window.localStorage.setItem("mamiTone", tone);
}

function getStoredNumber(key: string, fallback = 0) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  const n = raw ? Number(raw) : fallback;
  return Number.isFinite(n) ? n : fallback;
}

export default function HomePage() {
  const [tone, setTone] = React.useState<Tone>("cute");
  const [cardsCollected, setCardsCollected] = React.useState<number>(0);
  const [bestScore, setBestScore] = React.useState<number>(0);

  React.useEffect(() => {
    setTone(getStoredTone());
    setCardsCollected(getStoredNumber("mamiCardsCollected", 0));
    setBestScore(getStoredNumber("mamiBestScore", 0));
  }, []);

  const onToneChange = (next: Tone) => {
    setTone(next);
    setStoredTone(next);
  };

  return (
    <main className="page">
      <header className="header">
        <div className="titleBlock">
          <h1 className="title">Mami of GL</h1>
          <p className="subtitle">Catch the GL stars and collect zodiac energy</p>

          <div className="statusPill" aria-label="Progress status">
            <span>Cards: {cardsCollected}/12</span>
            <span className="dot" aria-hidden="true">•</span>
            <span>Best: {bestScore}</span>
          </div>
        </div>
      </header>

      <section className="hero" aria-label="Hero section">
        <div className="heroCard">
          <div className="sonyaFrame" aria-label="Sonya illustration placeholder">
            <div className="sonyaPlaceholder">
              <Image src="/characters/sonya.png" alt="Sonya chibi" width={340} height={340} className="sonyaArt" priority />
              <div className="sonyaText" aria-hidden="true">Sonya</div>
              <div className="sonyaHint">Add your illustration later</div>
            </div>
          </div>

          <div className="heroCopy">
            <p className="heroLine">Sonya enters the event.</p>
            <p className="heroLine">You catch the stars.</p>
          </div>
        </div>
      </section>

      <section className="actions" aria-label="Actions">
        <div className="progressPill" aria-label="Zodiac energy progress">
          Zodiac Energy <span className="progressStrong">{cardsCollected}/12</span>
        </div>

        <Link className="btnPrimary" href="/play">
          Play Now
        </Link>

        <Link className="btnSecondary" href="/collection">
          Zodiac Collection
        </Link>

        <div className="toneRow" aria-label="Caption tone">
          <span className="toneRowLabel">Caption tone</span>
          <div className="toneToggle" role="group" aria-label="Cute or Savage">
            <button
              type="button"
              className={`toneBtn ${tone === "cute" ? "active" : ""}`}
              onClick={() => onToneChange("cute")}
              aria-pressed={tone === "cute"}
            >
              Cute
            </button>

            <button
              type="button"
              className={`toneBtn ${tone === "savage" ? "active" : ""}`}
              onClick={() => onToneChange("savage")}
              aria-pressed={tone === "savage"}
            >
              Savage
            </button>
          </div>
        </div>

        <p className="tip">Tip: Lookmhee appears as a partner bonus</p>
      </section>

      <nav className="navBar" aria-label="Bottom navigation">
        <Link className="navLink navLinkActive" href="/">
          Home
        </Link>
        <Link className="navLink" href="/play">
          Play
        </Link>
        <Link className="navLink" href="/collection">
          Cards
        </Link>
      </nav>

      <style jsx>{`
        .page {
          min-height: 100svh;
          background: transparent;
          color: #1e1e1e;
          padding-bottom: 0;
        }

        .header {
          padding: 18px 16px 10px;
        }

        .titleBlock {
          max-width: 980px;
          margin: 0 auto;
        }

        .title {
          margin: 0;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0.2px;
        }

        .subtitle {
          margin: 8px 0 0;
          opacity: 0.82;
          font-size: 14px;
          line-height: 1.3;
        }

        .statusPill {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 13px;
          font-weight: 700;
        }

        .progressPill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 16px;
          font-weight: 800;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
          margin-bottom: 12px;
        }

        .progressStrong {
          font-weight: 950;
        }

        .dot {
          opacity: 0.5;
        }

        .hero {
          padding: 10px 16px 8px;
        }

        .heroCard {
          max-width: 980px;
          margin: 0 auto;
          padding: 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
          display: grid;
          gap: 12px;
        }

        .sonyaFrame {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.65);
          overflow: hidden;
        }

        .sonyaPlaceholder {
          height: 260px;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 16px;
        }

        .sonyaText {
          font-size: 20px;
          font-weight: 900;
        }

        .sonyaHint {
          margin-top: 6px;
          font-size: 12px;
          opacity: 0.72;
        }

        .heroCopy {
          padding: 2px 2px 0;
        }

        .heroLine {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.1px;
        }

        .heroLine + .heroLine {
          margin-top: 6px;
          opacity: 0.92;
        }

        .actions {
          padding: 10px 16px 18px;
          max-width: 980px;
          margin: 0 auto;
          display: grid;
          gap: 10px;
        }

        .btnPrimary,
        .btnSecondary {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          height: 48px;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 900;
          letter-spacing: 0.2px;
          border: 1px solid rgba(0, 0, 0, 0.12);
        }

        .btnPrimary {
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.07);
          color: #1e1e1e;
        }

        .btnSecondary {
          background: rgba(255, 255, 255, 0.6);
          color: #1e1e1e;
        }

        .howTo {
          justify-self: center;
          font-weight: 800;
          text-decoration: none;
          opacity: 0.85;
          padding: 8px 10px;
          border-radius: 10px;
          color: #1e1e1e;
        }

        .howTo:focus-visible,
        .btnPrimary:focus-visible,
        .btnSecondary:focus-visible,
        .toneBtn:focus-visible,
        .navItem:focus-visible {
          outline: 3px solid rgba(212, 175, 55, 0.35);
          outline-offset: 2px;
        }

        .toneBlock {
          margin-top: 6px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .toneLabel {
          font-size: 12px;
          font-weight: 900;
          opacity: 0.85;
        }

        .toneToggle {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .toneBtn {
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.6);
          font-weight: 900;
          cursor: pointer;
        }

        .toneBtn.active {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.07);
        }

        .tip {
          margin: 6px 0 0;
          font-size: 12px;
          opacity: 0.8;
          text-align: center;
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

        .navActive {
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.06);
        }

        @media (min-width: 900px) {
          .heroCard {
            grid-template-columns: 1.1fr 0.9fr;
            align-items: center;
          }

          .sonyaPlaceholder {
            height: 360px;
          }

          .title {
            font-size: 32px;
          }

          .subtitle {
            font-size: 15px;
          }

          .actions {
            grid-template-columns: 1fr;
            max-width: 520px;
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
      
        .ctaStack {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 46px;
          border-radius: 14px;
          font-weight: 900;
          text-decoration: none;
          border: 1px solid rgba(0, 0, 0, 0.10);
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.10);
          backdrop-filter: blur(10px);
        }

        .cta.primary {
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.70), rgba(180, 134, 35, 0.70));
          color: #1b1206;
          border-color: rgba(0,0,0,0.12);
        }

        .sonyaArt {
          width: min(320px, 72vw);
          height: auto;
          display: block;
          margin: 0 auto;
          filter: drop-shadow(0 18px 34px rgba(0,0,0,0.14));
          transform: translateY(6px);
        }

`}</style>
    </main>
  );
}
