"use client";

import React from "react";
import Link from "next/link";
import BottomTabs from "@/components/BottomTabs";
import { zodiacCards } from "@/lib/zodiacData";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
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

export default function HomePage() {
  const total = zodiacCards.actresses.length;

  const [tone, setTone] = React.useState<"cute" | "savage">("cute");
  const [collectedCount, setCollectedCount] = React.useState<number>(0);

  React.useEffect(() => {
    const collected = readSet("mami.collectedIds");
    setCollectedCount(collected.size);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("mami.captionTone", tone);
  }, [tone]);

  return (
    <main className="page">
      <section className="homeHero">
        <div className="homeTop">
          <h1 className="homeTitle">Mami of GL</h1>
          <p className="homeSub">Catch the GL stars and collect zodiac energy</p>

          <div className="glassRow">
            <div className="glassPill" role="button" aria-label="Energy type">
              <span className="pillText">Zodiac Energy</span>
              <span className="pillCaret">▾</span>
            </div>
            <div className="glassPill" aria-label="Duration">
              <span className="pillText">40 min</span>
              <span className="pillEdit" aria-hidden="true">✎</span>
            </div>
          </div>
        </div>

        <div className="homeCharacter">
          <img
            src="/img/sonya.png"
            alt="Sonya character"
            className="homeCharImg"
            draggable={false}
          />
        </div>

        <div className="homeProgress card">
          <div className="progressLabel">Zodiac Energy</div>
          <div className="progressValue">
            {collectedCount}/{total}
          </div>
        </div>

        <div className="homeActions">
          <Link className="btnPrimary" href="/play">
            Play Now
          </Link>
          <Link className="btnSecondary" href="/collection">
            Zodiac Collection
          </Link>

          <div className="toneBox">
            <div className="toneLabel">Caption tone</div>
            <div className="seg" role="tablist" aria-label="Caption tone">
              <button
                className={"segBtn" + (tone === "cute" ? " active" : "")}
                onClick={() => setTone("cute")}
                type="button"
              >
                Cute
              </button>
              <button
                className={"segBtn" + (tone === "savage" ? " active" : "")}
                onClick={() => setTone("savage")}
                type="button"
              >
                Savage
              </button>
            </div>
            <div className="toneHint">Tip: Lookmhee appears as a partner bonus</div>
          </div>
        </div>
      </section>

      <BottomTabs />
    </main>
  );
}
