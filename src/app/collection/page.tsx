"use client";

import Link from "next/link";
import React from "react";

import BottomTabs from "@/components/BottomTabs";
import zodiacCards from "@/data/zodiacCards.json";
import actressesData from "@/data/actresses.json";

type ZodiacRarity = "common" | "rare" | "partner";

type ZodiacCardData = {
  id: string;
  starSign: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  energy: string;
  rarity: ZodiacRarity;
  colourTheme: { primary: string; accent: string };
  unlockText: string;
  partnerBoostedText: string;
};

type ZodiacCardsJson = {
  meta: {
    version: string;
    totalCards: number;
    rarityTypes: ZodiacRarity[];
  };
  cards: ZodiacCardData[];
};

type Actress = {
  id: string;
  name: string;
  // e.g. "Gemini" (human readable)
  starSign: string;
  // e.g. "gemini" (id used to match ZodiacCardData.starSign)
  starSignId: string;
  chineseZodiac: string;
  birthdate: string;
};

function getLocalSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = window.localStorage.getItem(key);
  const parsed = safeParseJson<string[]>(raw);
  return toSet(parsed);
}

function shortName(full: string) {
  const trimmed = (full || "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (first.length <= 10) return first;
  return last.length <= 10 ? last : first.slice(0, 10);
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function toSet(arr: unknown): Set<string> {
  if (!Array.isArray(arr)) return new Set<string>();
  return new Set(arr.filter((x) => typeof x === "string") as string[]);
}

function formatRarity(r: ZodiacRarity) {
  if (r === "partner") return "Partner boosted";
  if (r === "rare") return "Rare";
  return "Common";
}

function getTone(): "cute" | "savage" {
  if (typeof window === "undefined") return "cute";
  const v = window.localStorage.getItem("mamiTone");
  return v === "savage" ? "savage" : "cute";
}

export default function CollectionPage() {
  const data = zodiacCards as ZodiacCardsJson;
  // actresses.json is shaped like { meta: {...}, actresses: [...] }
  const actresses = ((actressesData as unknown) as { actresses: Actress[] }).actresses;

  const [collectedIds, setCollectedIds] = React.useState<Set<string>>(new Set());
  const [partnerBoostedIds, setPartnerBoostedIds] = React.useState<Set<string>>(new Set());
  const [caughtActressIds, setCaughtActressIds] = React.useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [tone, setTone] = React.useState<"cute" | "savage">("cute");
  const [showCaughtModal, setShowCaughtModal] = React.useState(false);

  React.useEffect(() => {
    setTone(getTone());

    const collectedRaw = safeParseJson<string[]>(window.localStorage.getItem("mamiCollectedZodiacIds"));
    const partnerRaw = safeParseJson<string[]>(window.localStorage.getItem("mamiPartnerBoostedZodiacIds"));
    const caughtRaw = safeParseJson<string[]>(window.localStorage.getItem("mamiCaughtActressIds"));

    setCollectedIds(toSet(collectedRaw));
    setPartnerBoostedIds(toSet(partnerRaw));
    setCaughtActressIds(toSet(caughtRaw));
  }, []);

  const cards = data.cards ?? [];
  const collectedCount = cards.reduce((acc, c) => acc + (collectedIds.has(c.id) ? 1 : 0), 0);

  const selectedCard = selectedId ? cards.find((c) => c.id === selectedId) ?? null : null;
  const selectedCollected = selectedCard ? collectedIds.has(selectedCard.id) : false;
  const selectedPartner = selectedCard ? partnerBoostedIds.has(selectedCard.id) : false;
  const selectedActresses = selectedCard
    ? actresses
        .filter((a) => a.starSignId === selectedCard.id)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const closeModal = () => setSelectedId(null);

  React.useEffect(() => {
    if (!selectedId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  const clearProgress = () => {
    const ok = window.confirm("Clear your zodiac collection progress?");
    if (!ok) return;

    window.localStorage.removeItem("mamiCollectedZodiacIds");
    window.localStorage.removeItem("mamiPartnerBoostedZodiacIds");
    window.localStorage.setItem("mamiCardsCollected", "0");

    setCollectedIds(new Set());
    setPartnerBoostedIds(new Set());
  };

  return (
    <main className="page">
      <header className="header">
        <div className="headInner">
          <div>
            <h1 className="title">Zodiac Collection</h1>
            <p className="subtitle">
              Mami of GL · {collectedCount}/{cards.length} collected · Actresses caught: {caughtActressIds.size} · Tone: {tone}
            </p>
          </div>

          <div className="headActions">
            <button
              type="button"
              className="headBtn"
              onClick={() => setShowCaughtModal(true)}
            >
              Actresses
            </button>
            <Link className="headBtn" href="/play">
              Play
            </Link>
            <button type="button" className="headBtn ghost" onClick={clearProgress}>
              Clear
            </button>
          </div>
        </div>
      </header>

      <section className="gridWrap" aria-label="Zodiac cards">
        <div className="grid" role="list">
          {cards.map((card) => {
            const collected = collectedIds.has(card.id);
            const partner = partnerBoostedIds.has(card.id);
            const rarity: ZodiacRarity = partner ? "partner" : card.rarity;

            const bg = collected ? card.colourTheme.primary : "#F3F3F3";
            const border = collected ? card.colourTheme.accent : "#CFCFCF";
            const text = collected ? "#1E1E1E" : "#7A7A7A";

            return (
              <button
                key={card.id}
                type="button"
                role="listitem"
                className="card"
                onClick={() => setSelectedId(card.id)}
                aria-label={collected ? `${card.starSign} card` : `${card.starSign} card locked`}
                style={{
                  background: bg,
                  borderColor: border,
                  color: text,
                  opacity: collected ? 1 : 0.75
                }}
              >
                <div className="cardTop">
                  <div className="symbol" aria-hidden="true">
                    {card.symbol}
                  </div>
                  <div className="sign">{card.starSign}</div>
                </div>

                <div className="cardMid">
                  <div className="element">{card.element}</div>
                  <div className="energy">{card.energy}</div>
                </div>

                <div className="cardBottom">
                  <span className={`badge badge--${rarity}`}>{formatRarity(rarity)}</span>
                  {partner ? <span className="heart" aria-label="Partner boosted">♥</span> : null}
                </div>

                {!collected ? <div className="locked">Locked</div> : null}
              </button>
            );
          })}
        </div>
      </section>

      {selectedCard ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Card details">
          <button className="overlay" type="button" onClick={closeModal} aria-label="Close" />
          <div
            className="panel"
            style={{
              background: selectedCollected ? selectedCard.colourTheme.primary : "#F3F3F3",
              borderColor: selectedCollected ? selectedCard.colourTheme.accent : "#CFCFCF"
            }}
          >
            <div className="panelHeader">
              <div className="panelTitle">
                <span className="panelSymbol" aria-hidden="true">
                  {selectedCard.symbol}
                </span>
                <div>
                  <div className="panelName">
                    {selectedCollected ? selectedCard.starSign : `${selectedCard.starSign} (locked)`}
                  </div>
                  <div className="panelSub">
                    {selectedCard.element} · {selectedPartner ? "partner" : selectedCard.rarity}
                  </div>
                </div>
              </div>

              <button type="button" className="closeBtn" onClick={closeModal}>
                Close
              </button>
            </div>

            <div className="panelBody">
              <div className="row">
                <div className="label">Energy</div>
                <div className="value">{selectedCard.energy}</div>
              </div>

              <div className="row">
                <div className="label">Actresses</div>
                <div className="value">
                  {selectedActresses.length ? (
                    <div className="chips">
                      {selectedActresses.map((a) => {
                        const caught = caughtActressIds.has(a.id);
                        return (
                          <span key={a.id} className={`chip ${caught ? "chipOn" : ""}`}>
                            {shortName(a.name)}{caught ? " ✓" : ""}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="muted">No actresses mapped yet</span>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="label">Unlock line</div>
                <div className="value">
                  {selectedPartner ? selectedCard.partnerBoostedText : selectedCard.unlockText}
                </div>
              </div>

              {!selectedCollected ? <div className="hint">Catch an actress with this star sign to unlock it.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {showCaughtModal ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Actresses caught">
          <button
            className="overlay"
            type="button"
            onClick={() => setShowCaughtModal(false)}
            aria-label="Close"
          />
          <div className="panel">
            <div className="panelHeader">
              <div className="panelTitle">
                <div>
                  <div className="panelName">Actresses caught</div>
                  <div className="panelSub">{caughtActressIds.size} total</div>
                </div>
              </div>
              <button type="button" className="closeBtn" onClick={() => setShowCaughtModal(false)}>
                Close
              </button>
            </div>

            <div className="panelBody">
              {actresses.filter((a) => caughtActressIds.has(a.id)).length ? (
                <div className="chips">
                  {actresses
                    .filter((a) => caughtActressIds.has(a.id))
                    .sort((a, b) => a.starSignId.localeCompare(b.starSignId) || a.name.localeCompare(b.name))
                    .map((a) => (
                      <span key={a.id} className="chip chipOn">
                        {shortName(a.name)} · {a.starSignId}
                      </span>
                    ))}
                </div>
              ) : (
                <div className="muted">No actresses caught yet. Go to Play and start catching.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <BottomTabs />

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: transparent;
          color: #1e1e1e;
          padding-bottom: 76px;
        }

        .header {
          padding: 18px 16px 10px;
        }

        .headInner {
          max-width: 980px;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .title {
          margin: 0;
          font-size: 22px;
          font-weight: 900;
        }

        .subtitle {
          margin: 6px 0 0;
          font-size: 13px;
          opacity: 0.8;
        }

        .headActions {
          display: flex;
          gap: 10px;
        }

        .headBtn {
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: 900;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.85);
          color: #1e1e1e;
          cursor: pointer;
        }

        .ghost {
          background: rgba(255, 255, 255, 0.55);
        }

        .gridWrap {
          padding: 10px 16px 18px;
        }

        .grid {
          max-width: 980px;
          margin: 0 auto;
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .card {
          width: 100%;
          text-align: left;
          border: 1px solid;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
          transition: transform 120ms ease, box-shadow 120ms ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.09);
        }

        .cardTop {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }

        .symbol {
          font-size: 26px;
          line-height: 1;
        }

        .sign {
          font-size: 14px;
          font-weight: 900;
        }

        .cardMid {
          margin-top: 10px;
        }

        .element {
          font-size: 12px;
          opacity: 0.85;
        }

        .energy {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.25;
        }

        .cardBottom {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .badge {
          font-size: 11px;
          font-weight: 900;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.14);
          background: rgba(255, 255, 255, 0.55);
        }

        .badge--partner {
          border-color: rgba(212, 175, 55, 0.55);
          background: rgba(255, 255, 255, 0.8);
        }

        .heart {
          font-size: 14px;
          opacity: 0.9;
        }

        .locked {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 12px;
          opacity: 0.35;
          pointer-events: none;
        }

        .modal {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          padding: 16px;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          border: none;
        }

        .panel {
          position: relative;
          width: min(520px, 100%);
          border: 1px solid;
          border-radius: 18px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
          overflow: hidden;
        }

        .panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(6px);
        }

        .panelTitle {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .panelSymbol {
          font-size: 30px;
          line-height: 1;
        }

        .panelName {
          font-size: 16px;
          font-weight: 900;
        }

        .panelSub {
          margin-top: 2px;
          font-size: 12px;
          opacity: 0.8;
          text-transform: capitalize;
        }

        .closeBtn {
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.8);
          padding: 8px 10px;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .panelBody {
          padding: 14px;
        }

        .row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 10px;
          padding: 10px 0;
        }

        .label {
          font-size: 12px;
          font-weight: 900;
          opacity: 0.8;
        }

        .value {
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
        }

        .hint {
          margin-top: 10px;
          font-size: 12px;
          opacity: 0.85;
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

        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 900px) {
          .title {
            font-size: 26px;
          }

          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
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

        @media (max-width: 420px) {
          .row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
