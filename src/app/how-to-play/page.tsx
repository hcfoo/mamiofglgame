"use client";

import Link from "next/link";

export default function HowToPlayPage() {
  return (
    <main className="page">
      <header className="header">
        <h1 className="title">How to Play</h1>
        <p className="subtitle">Mami of GL</p>
      </header>

      <section className="steps">
        <div className="stepCard">
          <div className="stepNumber">①</div>
          <div className="stepContent">
            <h2 className="stepTitle">Move Sonya</h2>
            <p className="stepText">Swipe left or right to move Sonya across the fashion event.</p>
            <p className="stepHint">Desktop: use arrow keys or A and D.</p>
          </div>
        </div>

        <div className="stepCard">
          <div className="stepNumber">②</div>
          <div className="stepContent">
            <h2 className="stepTitle">Catch the actresses</h2>
            <p className="stepText">Catch GL actresses to earn points and unlock zodiac energy.</p>
          </div>
        </div>

        <div className="stepCard">
          <div className="stepNumber">③</div>
          <div className="stepContent">
            <h2 className="stepTitle">Collect zodiac cards</h2>
            <p className="stepText">
              Each actress unlocks a zodiac card. Complete all 12 to master the collection.
            </p>
          </div>
        </div>

        <div className="stepCard special">
          <div className="stepNumber">✦</div>
          <div className="stepContent">
            <h2 className="stepTitle">Partner bonus</h2>
            <p className="stepText">
              Lookmhee appears as a rare partner bonus. Catch her for extra points.
            </p>
          </div>
        </div>
      </section>

      <section className="modes">
        <h2 className="modesTitle">Game Modes</h2>

        <div className="modeCard">
          <h3 className="modeName">Free Play</h3>
          <p className="modeDesc">Play at your own pace.</p>
        </div>

        <div className="modeCard">
          <h3 className="modeName">60 Second Run</h3>
          <p className="modeDesc">Catch as many as you can before time runs out.</p>
        </div>
      </section>

      <section className="cta">
        <p className="ctaText">Ready to play?</p>
        <Link href="/play" className="btnPrimary">
          Start Playing
        </Link>
      </section>

      <nav className="navBar" aria-label="Bottom navigation">
        <Link className="navLink" href="/">
          Home
        </Link>
        <Link className="navLink navLinkActive" href="/how-to-play">
          Play
        </Link>
        <Link className="navLink" href="/collection">
          Cards
        </Link>
      </nav>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: transparent;
          color: #1e1e1e;
          padding-bottom: 76px;
        }

        .header {
          padding: 20px 16px 8px;
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

        .steps {
          padding: 12px 16px;
          max-width: 980px;
          margin: 0 auto;
          display: grid;
          gap: 12px;
        }

        .stepCard {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 12px;
          padding: 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .stepCard.special {
          background: rgba(255, 255, 255, 0.75);
        }

        .stepNumber {
          font-size: 20px;
          font-weight: 900;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .stepTitle {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
        }

        .stepText {
          margin: 6px 0 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .stepHint {
          margin: 6px 0 0;
          font-size: 12px;
          opacity: 0.75;
        }

        .modes {
          padding: 16px;
          max-width: 980px;
          margin: 0 auto;
        }

        .modesTitle {
          margin: 0 0 10px;
          font-size: 18px;
          font-weight: 900;
        }

        .modeCard {
          padding: 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.08);
          margin-bottom: 10px;
        }

        .modeName {
          margin: 0;
          font-size: 15px;
          font-weight: 900;
        }

        .modeDesc {
          margin-top: 6px;
          font-size: 14px;
          opacity: 0.85;
        }

        .cta {
          padding: 12px 16px 20px;
          text-align: center;
        }

        .ctaText {
          margin: 0 0 10px;
          font-size: 15px;
          font-weight: 800;
        }

        .btnPrimary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0 24px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.12);
          text-decoration: none;
          font-weight: 900;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.07);
          color: #1e1e1e;
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
          .title {
            font-size: 32px;
          }

          .steps {
            grid-template-columns: 1fr 1fr;
          }

          .cta {
            padding-bottom: 28px;
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
  );
}
