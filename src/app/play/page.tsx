"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

type Mode = "free" | "timed";

type Target = {
  id: string;
  x: number; // percent
  createdAt: number;
  durationMs: number;
};

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export default function PlayPage() {
  const [x, setX] = React.useState(50);
  const [score, setScore] = React.useState(0);
  const [caught, setCaught] = React.useState(0);
  const [mode, setMode] = React.useState<Mode>("free");
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [target, setTarget] = React.useState<Target | null>(null);

  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef(false);

  // Keyboard controls
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || k === "a") setX((v) => Math.max(0, v - 5));
      if (e.key === "ArrowRight" || k === "d") setX((v) => Math.min(100, v + 5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Touch / pointer drag on stage
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const toPercent = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      const p = ((clientX - rect.left) / rect.width) * 100;
      return Math.max(0, Math.min(100, p));
    };

    const onDown = (e: PointerEvent) => {
      draggingRef.current = true;
      setX(toPercent(e.clientX));
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      setX(toPercent(e.clientX));
    };
    const onUp = () => {
      draggingRef.current = false;
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // Spawn falling targets
  React.useEffect(() => {
    const spawn = () => {
      const durationMs = 2300;
      const t: Target = {
        id: uid(),
        x: Math.floor(Math.random() * 86) + 7,
        createdAt: Date.now(),
        durationMs
      };
      setTarget(t);

      // Clear if not caught by the end
      window.setTimeout(() => {
        setTarget((cur) => (cur?.id === t.id ? null : cur));
      }, durationMs + 60);
    };

    const id = window.setInterval(spawn, 1100);
    spawn();

    return () => window.clearInterval(id);
  }, []);

  // Timer for timed mode
  React.useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft <= 0) return;

    const id = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearInterval(id);
  }, [mode, timeLeft]);

  // Auto end timed run
  React.useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft > 0) return;

    window.localStorage.setItem("mamiLastScore", String(score));
    window.localStorage.setItem("mamiLastCaught", String(caught));

    const best = Number(window.localStorage.getItem("mamiBestScore") || "0");
    if (Number.isFinite(best) && score > best) window.localStorage.setItem("mamiBestScore", String(score));

    window.location.href = "/end";
  }, [mode, timeLeft, score, caught]);

  // Collision check using RAF: catch when target reaches "catch zone" (near bottom)
  React.useEffect(() => {
    let raf = 0;

    const loop = () => {
      if (target) {
        const now = Date.now();
        const progress = (now - target.createdAt) / target.durationMs; // 0..1
        const inCatchZone = progress >= 0.78 && progress <= 0.92;

        if (inCatchZone && Math.abs(target.x - x) < 8) {
          // caught
          setScore((s) => s + 10);
          setCaught((c) => c + 1);
          setTarget(null);
        }
      }

      raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [target, x]);

  const startTimed = () => {
    setMode("timed");
    setScore(0);
    setCaught(0);
    setTimeLeft(60);
  };

  const switchToFree = () => {
    setMode("free");
    setScore(0);
    setCaught(0);
    setTimeLeft(60);
  };

  return (
    <main className="page">
      <header className="hud">
        <div className="hudLeft">
          <div className="pill">Score: {score}</div>
          <div className="pill">Caught: {caught}</div>
        </div>
        <div className="hudRight">
          <div className="pill">{mode === "timed" ? `Time: ${timeLeft}` : "Free Play"}</div>
        </div>
      </header>

      <section className="stage" ref={stageRef} aria-label="Play area">
        <div className="spotlight" aria-hidden="true" />
        <div className="runway" aria-hidden="true" />

        {target ? (
          <div className="target" style={{ left: `${target.x}%` }} aria-label="Target">
            <span className="targetIcon" aria-hidden="true">
              ★
            </span>
          </div>
        ) : null}

        <div className="sonya" style={{ left: `${x}%` }} aria-label="Sonya">
          <div className="sonyaGlow" aria-hidden="true" />
          <div className="sonyaImg">
            <Image
              src="/characters/sonya.png"
              alt="Sonya"
              fill
              priority
              sizes="140px"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        <div className="hint">
          Drag anywhere to move, or use arrow keys
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
        <button type="button" onClick={mode === "timed" ? switchToFree : startTimed}>
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
          color: #1e1e1e;
        }

        .hud {
          height: 56px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 14px;
          background: rgba(250, 247, 241, 0.92);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
        }

        .hudLeft,
        .hudRight {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .pill {
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-weight: 900;
          font-size: 13px;
        }

        .stage {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at 50% 10%, rgba(212, 175, 55, 0.12), transparent 55%),
            linear-gradient(#fdfaf4, #f3eadb);
          touch-action: none;
          user-select: none;
        }

        .spotlight {
          position: absolute;
          inset: -30% -20%;
          background: radial-gradient(circle at 60% 35%, rgba(255, 255, 255, 0.7), transparent 55%);
          opacity: 0.55;
          pointer-events: none;
        }

        .runway {
          position: absolute;
          left: -10%;
          right: -10%;
          bottom: 0;
          height: 38%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.06));
          pointer-events: none;
        }

        .target {
          position: absolute;
          top: -24px;
          transform: translateX(-50%);
          animation: fall 2.3s linear forwards;
          filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.18));
        }

        .targetIcon {
          font-size: 28px;
        }

        @keyframes fall {
          0% { transform: translateX(-50%) translateY(0); opacity: 0.95; }
          85% { opacity: 0.95; }
          100% { transform: translateX(-50%) translateY(88vh); opacity: 0.0; }
        }

        .sonya {
          position: absolute;
          bottom: 140px;
          transform: translateX(-50%);
          width: 140px;
          height: 140px;
        }

        .sonyaGlow {
          position: absolute;
          inset: -14px;
          background: radial-gradient(circle at 50% 55%, rgba(212, 175, 55, 0.22), transparent 60%);
          opacity: 0.9;
          pointer-events: none;
        }

        .sonyaImg {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          padding: 10px;
        }

        .hint {
          position: absolute;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 900;
          opacity: 0.7;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 14px;
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
          .sonya {
            bottom: 150px;
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

          @keyframes fall {
            0% { transform: translateX(-50%) translateY(0); opacity: 0.95; }
            90% { opacity: 0.95; }
            100% { transform: translateX(-50%) translateY(78vh); opacity: 0.0; }
          }
        }
      `}</style>
    </main>
  );
}
