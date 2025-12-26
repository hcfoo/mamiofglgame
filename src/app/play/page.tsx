"use client";

import Link from "next/link";
import React from "react";

type Mode = "free" | "timed";

export default function PlayPage() {
  const [x, setX] = React.useState(50);
  const [score, setScore] = React.useState(0);
  const [caught, setCaught] = React.useState(0);
  const [mode, setMode] = React.useState<Mode>("free");
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [spawnX, setSpawnX] = React.useState<number | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || k === "a") setX((v) => Math.max(0, v - 5));
      if (e.key === "ArrowRight" || k === "d") setX((v) => Math.min(100, v + 5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => {
      setSpawnX(Math.floor(Math.random() * 90) + 5);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [mode, timeLeft]);

  React.useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft > 0) return;

    window.localStorage.setItem("mamiLastScore", String(score));
    window.localStorage.setItem("mamiLastCaught", String(caught));
    const best = Number(window.localStorage.getItem("mamiBestScore") || "0");
    if (Number.isFinite(best) && score > best) window.localStorage.setItem("mamiBestScore", String(score));

    window.location.href = "/end";
  }, [timeLeft, mode, score, caught]);

  React.useEffect(() => {
    if (spawnX === null) return;
    if (Math.abs(spawnX - x) < 8) {
      setScore((s) => s + 10);
      setCaught((c) => c + 1);
      setSpawnX(null);
    }
  }, [spawnX, x]);

  const startTimed = () => {
    setMode("timed");
    setScore(0);
    setCaught(0);
    setTimeLeft(60);
    setSpawnX(null);
  };

  const resetFree = () => {
    setMode("free");
    setScore(0);
    setCaught(0);
    setSpawnX(null);
  };

  return (
    <main className="page">
      <header className="hud">
        <div>Score: {score}</div>
        <div>{mode === "timed" ? `Time: ${timeLeft}` : "Free Play"}</div>
        <div>🃏</div>
      </header>

      <section className="stage" aria-label="Play area">
        {spawnX !== null ? (
          <div className="actress" style={{ left: `${spawnX}%` }} aria-label="Actress target">
            ★
          </div>
        ) : null}

        <div className="sonya" style={{ left: `${x}%` }} aria-label="Sonya">
          Sonya
        </div>
      </section>

      <section className="controls" aria-label="Touch controls">
        <button type="button" onClick={() => setX((v) => Math.max(0, v - 10))} aria-label="Move left">
          ◄
        </button>
        <button type="button" onClick={() => setX((v) => Math.min(100, v + 10))} aria-label="Move right">
          ►
        </button>
      </section>

      <section className="modes" aria-label="Mode controls">
        <button type="button" onClick={mode === "timed" ? resetFree : startTimed}>
          {mode === "timed" ? "Switch to Free Play" : "60 Second Run"}
        </button>
        <Link href="/" className="exit">
          Exit
        </Link>
      </section>

      <nav className="bottomNav" aria-label="Bottom navigation">
        <Link className="navItem" href="/">
          Home
        </Link>
        <Link className="navItem navActive" href="/play">
          Play
        </Link>
        <Link className="navItem" href="/collection">
          Cards
        </Link>
      </nav>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #faf7f1;
          display: flex;
          flex-direction: column;
          padding-bottom: 76px;
        }

        .hud {
          height: 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
          background: rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          font-weight: 900;
          color: #1e1e1e;
        }

        .stage {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: linear-gradient(#fdfaf4, #f5efe6);
        }

        .sonya {
          position: absolute;
          bottom: 88px;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.9);
          padding: 10px 14px;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          font-weight: 900;
        }

        .actress {
          position: absolute;
          top: 38%;
          transform: translateX(-50%);
          font-size: 28px;
          filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.15));
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 20px;
          padding: 10px 16px 6px;
        }

        .controls button {
          width: 64px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          font-weight: 900;
          color: #1e1e1e;
        }

        .modes {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 16px 16px;
          gap: 10px;
        }

        .modes button,
        .exit {
          flex: 1;
          padding: 10px 14px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.9);
          font-weight: 900;
          text-decoration: none;
          color: #1e1e1e;
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
