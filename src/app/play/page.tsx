"use client";

import Image from "next/image";
import React from "react";

import BottomTabs from "@/components/BottomTabs";

import actressesData from "@/data/actresses.json";

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
  speed: number;
};

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function shortName(full: string) {
  const clean = (full || "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length <= 2) return clean;
  const first = parts[0];
  const lastInitial = parts[parts.length - 1]?.[0] || "";
  return `${first} ${lastInitial}.`;
}

function getTone(): Tone {
  if (typeof window === "undefined") return "cute";
  const v = window.localStorage.getItem("mamiTone");
  return v === "savage" ? "savage" : "cute";
}

function cuteLine(name: string, sign: string) {
  const pool = [
    `Caught ${name}, ${sign} energy secured`,
    `${name} spotted, destiny says yes`,
    `Soft catch, big vibes, hello ${name}`,
    `${name} collected, runway blessed`
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function savageLine(name: string, sign: string) {
  const pool = [
    `Caught ${name}, runway cleared`,
    `${name} secured, ${sign} power unlocked`,
    `No excuses, only catches, hi ${name}`,
    `${name} tried to pass, I said not today`
  ];
  return pool[Math.floor(Math.random() * pool.length)];
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

function setLocalSet(key: string, ids: Set<string>) {
  window.localStorage.setItem(key, JSON.stringify(Array.from(ids)));
}

export default function PlayPage() {
  const actresses: Actress[] = (actressesData as any).actresses ?? [];

  const stageRef = React.useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = React.useState<Mode>("timed");
  const [tone, setTone] = React.useState<Tone>("cute");

  const [timeLeft, setTimeLeft] = React.useState(60);
  const [score, setScore] = React.useState(0);
  const [caught, setCaught] = React.useState(0);
  const [runCaughtIds, setRunCaughtIds] = React.useState<Set<string>>(() => new Set());
  const [streak, setStreak] = React.useState(0);
  const [toast, setToast] = React.useState("");

  const [targetXPct, setTargetXPct] = React.useState(50);
  const [renderXPct, setRenderXPct] = React.useState(50);

  const [falling, setFalling] = React.useState<Falling[]>([]);

  React.useEffect(() => {
    setTone(getTone());
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || k === "a") setTargetXPct((v) => clamp(v - 6, 0, 100));
      if (e.key === "ArrowRight" || k === "d") setTargetXPct((v) => clamp(v + 6, 0, 100));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const toPct = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      const p = ((clientX - rect.left) / rect.width) * 100;
      return clamp(p, 0, 100);
    };

    const onDown = (e: PointerEvent) => setTargetXPct(toPct(e.clientX));
    const onMove = (e: PointerEvent) => {
      if (e.buttons === 0) return;
      setTargetXPct(toPct(e.clientX));
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);

  React.useEffect(() => {
    let raf = 0;
    const loop = () => {
      setRenderXPct((x) => x + (targetXPct - x) * 0.22);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [targetXPct]);

  React.useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft <= 0) return;
    const id = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearInterval(id);
  }, [mode, timeLeft]);

  React.useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft > 0) return;

    window.localStorage.setItem("mamiLastScore", String(score));
    window.localStorage.setItem("mamiLastCaught", String(caught));
    window.localStorage.setItem(
      "mamiLastCaughtIds",
      JSON.stringify(Array.from(runCaughtIds))
    );

    const best = Number(window.localStorage.getItem("mamiBestScore") || "0");
    if (Number.isFinite(best) && score > best) window.localStorage.setItem("mamiBestScore", String(score));

    window.location.href = "/end";
  }, [mode, timeLeft, score, caught, runCaughtIds]);

  React.useEffect(() => {
    if (actresses.length === 0) return;

    const MAX_FALLING = 2;
    const spawnMs = mode === "timed" ? 1350 : 1550;

    const spawn = () => {
      setFalling((cur) => {
        if (cur.length >= MAX_FALLING) return cur;

        const pick = actresses[Math.floor(Math.random() * actresses.length)];
        const base = mode === "timed" ? 120 : 105;
        const speed = base + Math.random() * 55;

        const next: Falling = {
          id: uid(),
          actress: pick,
          // Keep within safe bounds so the pill never clips off-screen on mobile
          xPct: Math.floor(Math.random() * 70) + 15,
          yPx: -88,
          speed
        };

        return [...cur, next];
      });
    };

    const id = window.setInterval(spawn, spawnMs);
    spawn();
    return () => window.clearInterval(id);
  }, [actresses, mode]);

  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const el = stageRef.current;
      const stageH = el ? el.getBoundingClientRect().height : 700;

      const dt = (now - last) / 1000;
      last = now;

      const catchY = stageH - 230;

      setFalling((cur) => {
        const next: Falling[] = [];
        for (const f of cur) {
          const y = f.yPx + f.speed * dt;

          const inBand = y >= catchY - 30 && y <= catchY + 44;
          const nearX = Math.abs(f.xPct - renderXPct) < 10;

          if (inBand && nearX) {
            const combo = Math.min(10, streak + 1);
            const pts = 12 + combo * 2;

            setScore((s) => s + pts);
            setCaught((c) => c + 1);
            setStreak(combo);

            const nm = shortName(f.actress.name);
            const line = tone === "savage" ? savageLine(nm, f.actress.starSign) : cuteLine(nm, f.actress.starSign);
            setToast(line);
            window.setTimeout(() => setToast(""), 900);

            const collected = getLocalSet("mamiCollectedZodiacIds");
            collected.add(f.actress.starSignId);
            setLocalSet("mamiCollectedZodiacIds", collected);
            window.localStorage.setItem("mamiCardsCollected", String(collected.size));

            // Persist caught actresses (overall) and this run
            const allCaught = getLocalSet("mamiCaughtActressIds");
            allCaught.add(f.actress.id);
            setLocalSet("mamiCaughtActressIds", allCaught);
            setRunCaughtIds((prev) => {
              const nextSet = new Set(prev);
              nextSet.add(f.actress.id);
              return nextSet;
            });

            continue;
          }

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
  }, [renderXPct, streak, tone]);

  const startTimed = () => {
    setMode("timed");
    setTimeLeft(60);
    setScore(0);
    setCaught(0);
    setStreak(0);
    setFalling([]);
    setToast("");
    setRunCaughtIds(new Set());
  };

  const switchToFree = () => {
    setMode("free");
    setTimeLeft(60);
    setScore(0);
    setCaught(0);
    setStreak(0);
    setFalling([]);
    setToast("");
    setRunCaughtIds(new Set());
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
          >
            <div className="pillTag">
              <span className="spark" aria-hidden="true">✦</span>
              <span className="pillName" title={f.actress.name}>{shortName(f.actress.name)}</span>
              <span className="sep" aria-hidden="true">•</span>
              <span className="pillMeta">{f.actress.starSign}</span>
            </div>
          </div>
        ))}

        <div className="sonya" style={{ left: `${renderXPct}%` }} aria-label="Sonya">
          <Image
            src="/characters/sonya.png"
            alt="Sonya"
            fill
            priority
            sizes="(max-width: 520px) 160px, 180px"
            style={{ objectFit: "contain" }}
          />
        </div>

        {toast ? <div className="toast" role="status">{toast}</div> : null}

        <div className="hint">Drag to move</div>
      </section>

      <BottomTabs />

      <style jsx>{`
        .page {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          padding-bottom: calc(var(--navH) + 14px + env(safe-area-inset-bottom));
          background:
            radial-gradient(900px 600px at 50% 0%, rgba(255, 255, 255, 0.92), rgba(248, 242, 231, 0.98)),
            radial-gradient(900px 700px at 50% 70%, rgba(255, 232, 196, 0.55), rgba(0, 0, 0, 0));
        }

        .page:before {
          content: "";
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.65) 0 2px, rgba(255, 255, 255, 0) 3px),
            radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.6) 0 2px, rgba(255, 255, 255, 0) 3px),
            radial-gradient(circle at 40% 70%, rgba(255, 255, 255, 0.55) 0 2px, rgba(255, 255, 255, 0) 3px);
          opacity: 0.35;
          filter: blur(0.2px);
          pointer-events: none;
        }

        .hud {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          padding: calc(env(safe-area-inset-top) + 10px) 14px 10px;
          background: rgba(255, 255, 255, 0.55);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          backdrop-filter: blur(12px);
        }

        .hudLeft, .hudRight {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          width: 100%;
        }

        .brand {
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 950;
          background: rgba(255,255,255,0.70);
          border: 1px solid rgba(0,0,0,0.08);
        }

        .pill {
          padding: 8px 10px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 13px;
          background: rgba(255,255,255,0.68);
          border: 1px solid rgba(0,0,0,0.08);
        }

        .stage {
          position: relative;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          touch-action: none;
          user-select: none;
          background: radial-gradient(circle at 50% 0%, rgba(212,175,55,0.16), transparent 55%),
                      linear-gradient(180deg, rgba(255,255,255,0.38), rgba(0,0,0,0.03));
        }

        .lights {
          position: absolute;
          inset: -40% -20%;
          background:
            radial-gradient(circle at 22% 20%, rgba(255,255,255,0.62), transparent 48%),
            radial-gradient(circle at 82% 18%, rgba(255,255,255,0.55), transparent 52%),
            radial-gradient(circle at 60% 72%, rgba(255,255,255,0.42), transparent 55%);
          opacity: 0.55;
          pointer-events: none;
        }

        .runway {
          position: absolute;
          left: -10%;
          right: -10%;
          bottom: 0;
          height: 44%;
          background:
            linear-gradient(180deg, rgba(255,255,255,0), rgba(0,0,0,0.06)),
            radial-gradient(60% 85% at 50% 100%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
          pointer-events: none;
        }

        .falling { position: absolute; top: 0; }

        .pillTag {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(0,0,0,0.10);
          box-shadow: 0 14px 38px rgba(0,0,0,0.10);
          backdrop-filter: blur(10px);
          max-width: min(360px, 86vw);
        }

        .spark { color: rgba(212,175,55,1); }

        .pillName {
          font-weight: 950;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }

        .sep { opacity: 0.45; }

        .pillMeta { font-weight: 900; opacity: 0.78; white-space: nowrap; }

        .sonya {
          position: absolute;
          bottom: calc(90px + env(safe-area-inset-bottom));
          transform: translateX(-50%);
          width: min(240px, 52vw);
          height: auto;
          pointer-events: none;
          filter: drop-shadow(0 18px 34px rgba(0,0,0,0.14));
        }

        .toast {
          position: absolute;
          left: 50%;
          top: 14px;
          transform: translateX(-50%);
          max-width: min(640px, 92vw);
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.74);
          border: 1px solid rgba(0,0,0,0.10);
          font-weight: 950;
          text-align: center;
          box-shadow: 0 16px 40px rgba(0,0,0,0.10);
          backdrop-filter: blur(10px);
        }

        .hint {
          position: absolute;
          left: 50%;
          bottom: 12px;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 900;
          opacity: 0.72;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.60);
          border: 1px solid rgba(0,0,0,0.08);
          backdrop-filter: blur(10px);
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
          border: 1px solid rgba(0,0,0,0.15);
          background: rgba(255,255,255,0.92);
          font-size: 18px;
          font-weight: 950;
          color: #1e1e1e;
        }

        .modes {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 10px;
          padding: 6px 16px 16px;
        }

        .modes button, .ghost {
          height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.15);
          background: rgba(255,255,255,0.90);
          font-weight: 950;
          text-decoration: none;
          color: #1e1e1e;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ghost { background: rgba(255,255,255,0.62); }

        @media (max-width: 520px) {
          .modes { grid-template-columns: 1fr; }
          .sonya { width: 160px; height: 160px; bottom: 50px; }
          .pillName { max-width: 140px; }
        }
      `}</style>
    </main>
  );
}
