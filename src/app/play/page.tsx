"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

import actressesData from "@/data/actresses.json";
import zodiacCards from "@/data/zodiacCards.json";

type Mode = "free" | "timed";
type Tone = "cute" | "savage";

type Actress = {
  id: string;
  name: string;
  starSign: string;
  starSignId: string;
  chineseZodiac: string;
  birthdate: string;
};

type Falling = {
  id: string;
  actress: Actress;
  xPct: number;
  yPx: number;
  speedPxPerSec: number;
  bornAt: number;
};

type ZodiacCard = {
  id: string;
  starSign: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  energy: string;
  rarity: "common" | "rare" | "partner";
  colourTheme: { primary: string; accent: string };
  unlockText: string;
  partnerBoostedText: string;
};

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function getTone(): Tone {
  if (typeof window === "undefined") return "cute";
  const v = window.localStorage.getItem("mamiTone");
  return v === "savage" ? "savage" : "cute";
}

function cuteLines(name: string, sign: string) {
  const pool = [
    `Caught ${name} (${sign}) and my heart just did a little twirl`,
    `${name} spotted, ${sign} energy collected`,
    `Aaaa ${name} is here, ${sign} luck activated`,
    `Soft catch, big vibes, hello ${name}`
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function savageLines(name: string, sign: string) {
  const pool = [
    `Caught ${name} (${sign}), runway cleared`,
    `${name} secured, ${sign} power unlocked`,
    `No excuses, only catches, hi ${name}`,
    `${name} tried to pass, I said not today`
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function setLocalSet(key: string, ids: Set<string>) {
  window.localStorage.setItem(key, JSON.stringify(Array.from(ids)));
}

function getLocalSet(key: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export default function PlayPage() {
  const actresses: Actress[] = (actressesData as any).actresses ?? [];
  const zodiac: ZodiacCard[] = (zodiacCards as any).cards ?? [];

  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef(false);

  const [mode, setMode] = React.useState<Mode>("timed");
  const [tone, setTone] = React.useState<Tone>("cute");

  const [timeLeft, setTimeLeft] = React.useState(60);
  const [score, setScore] = React.useState(0);
  const [caught, setCaught] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [toast, setToast] = React.useState<string>("");

  const [sonyaXPct, setSonyaXPct] = React.useState(50);

  const [falling, setFalling] = React.useState<Falling[]>([]);

  // Initialise tone from storage
  React.useEffect(() => {
    setTone(getTone());
  }, []);

  // Keyboard controls
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || k === "a") setSonyaXPct((v) => clamp(v - 5, 0, 100));
      if (e.key === "ArrowRight" || k === "d") setSonyaXPct((v) => clamp(v + 5, 0, 100));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pointer drag on stage
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const toPct = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      const p = ((clientX - rect.left) / rect.width) * 100;
      return clamp(p, 0, 100);
    };

    const onDown = (e: PointerEvent) => {
      draggingRef.current = true;
      setSonyaXPct(toPct(e.clientX));
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      setSonyaXPct(toPct(e.clientX));
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

  // Timer
  React.useEffect(() => {
    if (mode !== "timed") return;

    if (timeLeft <= 0) return;

    const id = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearInterval(id);
  }, [mode, timeLeft]);

  // End run
  React.useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft > 0) return;

    window.localStorage.setItem("mamiLastScore", String(score));
    window.localStorage.setItem("mamiLastCaught", String(caught));
    const best = Number(window.localStorage.getItem("mamiBestScore") || "0");
    if (Number.isFinite(best) && score > best) window.localStorage.setItem("mamiBestScore", String(score));

    window.location.href = "/end";
  }, [mode, timeLeft, score, caught]);

  // Spawn actresses
  React.useEffect(() => {
    if (actresses.length === 0) return;

    const spawn = () => {
      const baseSpeed = mode === "timed" ? 260 : 220;
      const speed = baseSpeed + Math.random() * 160;
      const pick = actresses[Math.floor(Math.random() * actresses.length)];

      setFalling((cur) => {
        const next: Falling = {
          id: uid(),
          actress: pick,
          xPct: Math.floor(Math.random() * 86) + 7,
          yPx: -90,
          speedPxPerSec: speed,
          bornAt: Date.now()
        };
        // Keep list small
        const trimmed = cur.slice(-5);
        return [...trimmed, next];
      });
    };

    const ms = mode === "timed" ? 900 : 1100;
    const id = window.setInterval(spawn, ms);
    spawn();

    return () => window.clearInterval(id);
  }, [actresses, mode]);

  // Animation loop
  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const el = stageRef.current;
      const stageH = el ? el.getBoundingClientRect().height : 600;

      const dt = (now - last) / 1000;
      last = now;

      setFalling((cur) => {
        if (cur.length === 0) return cur;

        const sonyaX = sonyaXPct;
        const catchY = stageH - 210; // catch zone around Sonya height
        const next: Falling[] = [];

        for (const f of cur) {
          const y = f.yPx + f.speedPxPerSec * dt;

          // collision: in catch band and near X
          const inBand = y >= catchY - 25 && y <= catchY + 35
          const nearX = Math.abs(f.xPct - sonyaX) < 9;

          if (inBand && nearX) {
            // caught
            const combo = Math.min(8, streak + 1);
            const points = 10 + combo * 2;

            // update score and streak outside loop via functional updates
            setScore((s) => s + points);
            setCaught((c) => c + 1);
            setStreak(combo);

            const line = tone === "savage" ? savageLines(f.actress.name, f.actress.starSign) : cuteLines(f.actress.name, f.actress.starSign);
            setToast(line);
            window.setTimeout(() => setToast(""), 1200);

            // unlock zodiac card by star sign
            const collected = getLocalSet("mamiCollectedZodiacIds");
            collected.add(f.actress.starSignId);
            setLocalSet("mamiCollectedZodiacIds", collected);
            window.localStorage.setItem("mamiCardsCollected", String(collected.size));

            continue;
          }

          // missed: if goes past bottom
          if (y > stageH + 120) {
            setStreak(0);
            continue;
          }

          next.push({ ...f, yPx: y });
        }

        return next;
      });

      raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [sonyaXPct, streak, tone]);

  const startRun = () => {
    setMode("timed");
    setTimeLeft(60);
    setScore(0);
    setCaught(0);
    setStreak(0);
    setFalling([]);
    setToast("");
  };

  const freePlay = () => {
    setMode("free");
    setTimeLeft(60);
    setScore(0);
    setCaught(0);
    setStreak(0);
    setFalling([]);
    setToast("");
  };

  const cardsCollected = (() => {
    if (typeof window === "undefined") return 0;
    const n = Number(window.localStorage.getItem("mamiCardsCollected") || "0");
    return Number.isFinite(n) ? n : 0;
  })();

  return (
    <main className="page">
      <header className="hud">
        <div className="hudLeft">
          <div className="brand">Mami of GL</div>
          <div className="pill">Score {score}</div>
          <div className="pill">Streak {streak}</div>
        </div>

        <div className="hudRight">
          <div className="pill">Cards {cardsCollected}/12</div>
          <div className="pill">{mode === "timed" ? `Time ${timeLeft}` : "Free play"}</div>
        </div>
      </header>

      <section className="stage" ref={stageRef} aria-label="Play area">
        <div className="lights" aria-hidden="true" />
        <div className="runway" aria-hidden="true" />

        {falling.map((f) => (
          <div
            key={f.id}
            className="falling"
            style={{ left: `${f.xPct}%`, transform: `translate(-50%, ${f.yPx}px)` }}
            aria-label={`${f.actress.name} ${f.actress.starSign}`}
          >
            <div className="tagTop">
              <span className="star" aria-hidden="true">★</span>
              <span className="name">{f.actress.name}</span>
            </div>
            <div className="tagBottom">
              <span className="sign">{f.actress.starSign}</span>
              <span className="dot" aria-hidden="true">•</span>
              <span className="cz">{f.actress.chineseZodiac}</span>
            </div>
          </div>
        ))}

        <div className="sonya" style={{ left: `${sonyaXPct}%` }} aria-label="Sonya">
          <div className="sonyaGlow" aria-hidden="true" />
          <div className="sonyaImg">
            <Image src="/characters/sonya.png" alt="Sonya" fill priority sizes="160px" style={{ objectFit: "contain" }} />
          </div>
        </div>

        {toast ? <div className="toast" role="status">{toast}</div> : null}

        <div className="hint">Drag anywhere to move Sonya, or use arrow keys</div>
      </section>

      <section className="controls" aria-label="Controls">
        <button type="button" onClick={() => setSonyaXPct((v) => clamp(v - 10, 0, 100))}>◄</button>
        <button type="button" onClick={() => setSonyaXPct((v) => clamp(v + 10, 0, 100))}>►</button>
      </section>

      <section className="modes" aria-label="Modes">
        <button type="button" onClick={mode === "timed" ? freePlay : startRun}>
          {mode === "timed" ? "Switch to free play" : "Start 60 second run"}
        </button>
        <Link href="/collection" className="ghost">View collection</Link>
        <Link href="/" className="ghost">Exit</Link>
      </section>

      <nav className="bottomNav" aria-label="Bottom navigation">
        <Link className="navItem" href="/">Home</Link>
        <Link className="navItem navActive" href="/play">Play</Link>
        <Link className="navItem" href="/collection">Cards</Link>
      </nav>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: transparent;
          display: flex;
          flex-direction: column;
          padding-bottom: 76px;
          color: #1e1e1e;
        }

        .hud {
          height: 62px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 14px;
          background: rgba(250, 247, 241, 0.92);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
          gap: 10px;
        }

        .hudLeft, .hudRight {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .brand {
          font-weight: 900;
          letter-spacing: 0.2px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(0, 0, 0, 0.08);
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
          background:
            radial-gradient(circle at 50% 10%, rgba(212, 175, 55, 0.14), transparent 55%),
            linear-gradient(#fdfaf4, #f2e7d6);
          touch-action: none;
          user-select: none;
        }

        .lights {
          position: absolute;
          inset: -40% -20%;
          background:
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.65), transparent 50%),
            radial-gradient(circle at 80% 25%, rgba(255, 255, 255, 0.55), transparent 52%),
            radial-gradient(circle at 60% 70%, rgba(255, 255, 255, 0.45), transparent 55%);
          opacity: 0.55;
          pointer-events: none;
        }

        .runway {
          position: absolute;
          left: -10%;
          right: -10%;
          bottom: 0;
          height: 42%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.06));
          pointer-events: none;
        }

        .falling {
          position: absolute;
          top: 0;
          width: min(320px, 82vw);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
          padding: 10px 12px;
          will-change: transform;
        }

        .tagTop {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-weight: 900;
        }

        .star {
          color: rgba(212, 175, 55, 1);
        }

        .name {
          font-size: 13px;
          line-height: 1.15;
        }

        .tagBottom {
          margin-top: 4px;
          display: flex;
          gap: 8px;
          align-items: center;
          font-weight: 900;
          font-size: 12px;
          opacity: 0.82;
        }

        .dot {
          opacity: 0.5;
        }

        .sonya {
          position: absolute;
          bottom: 148px;
          transform: translateX(-50%);
          width: 160px;
          height: 160px;
        }

        .sonyaGlow {
          position: absolute;
          inset: -18px;
          background: radial-gradient(circle at 50% 55%, rgba(212, 175, 55, 0.24), transparent 60%);
          opacity: 0.95;
          pointer-events: none;
        }

        .sonyaImg {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          padding: 12px;
        }

        .toast {
          position: absolute;
          left: 50%;
          top: 18px;
          transform: translateX(-50%);
          max-width: min(640px, 90vw);
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(0, 0, 0, 0.12);
          font-weight: 900;
          text-align: center;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.10);
        }

        .hint {
          position: absolute;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 900;
          opacity: 0.72;
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
          background: rgba(255, 255, 255, 0.92);
          font-size: 18px;
          font-weight: 900;
          color: #1e1e1e;
        }

        .modes {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 10px;
          padding: 6px 16px 16px;
        }

        .modes button,
        .ghost {
          height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.92);
          font-weight: 900;
          text-decoration: none;
          color: #1e1e1e;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ghost {
          background: rgba(255, 255, 255, 0.62);
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

        @media (max-width: 520px) {
          .modes {
            grid-template-columns: 1fr;
          }
          .sonya {
            bottom: 140px;
          }
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
