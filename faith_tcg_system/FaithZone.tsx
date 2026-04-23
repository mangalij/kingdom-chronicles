import React from "react";

export function FaithZone({ faithCards, isOwner, onReveal }) {
  return (
    <div className="faith-zone">
      {faithCards.map(card => {
        const stateClass =
          card.state === "READY" ? "faith-ready" :
          card.state === "DECAYING" ? "faith-decaying" :
          card.disrupted ? "faith-disrupted" :
          "faith-charging";

        return (
          <div key={card.id} className={`faith-card ${stateClass}`}>
            {card.isHidden && !isOwner ? (
              <div className="card-back">Faith</div>
            ) : (
              <div>{card.baseCardId}</div>
            )}

            <div>
              {card.turnsInFaith} / {card.revealThreshold}
            </div>

            {card.disrupted && card.state === "CHARGING" && (
              <div className="faith-disrupted-badge">😈 DISRUPTED</div>
            )}

            {card.state === "DECAYING" && (
              <div className="faith-decaying-badge">⚠️ DECAYING (50% bonus)</div>
            )}

            {(card.state === "READY" || card.state === "DECAYING") && isOwner && (
              <button onClick={() => onReveal(card.id)}>
                {card.state === "DECAYING" ? "⚠️ Reveal (50%)" : "Reveal"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
