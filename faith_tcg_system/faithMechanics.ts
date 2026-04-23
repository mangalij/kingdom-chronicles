import { GameState } from "./GameState";
import { FaithCard } from "./FaithCard";

export type FaithCommitCost = "skip_draw" | "lose_mana";

export const MAX_FAITH_ZONE = 3;
export const MAX_FAITH_ZONE_EARLY = 2;
export const FAITH_ZONE_TURN_THRESHOLD = 5;
export const DECAY_AFTER_READY = 2;
export const DOUBT_CANCEL_EXTRA = 2;
export const FAITH_COMMIT_COST: FaithCommitCost = "skip_draw";

export function getMaxFaithZone(turn: number): number {
  return turn < FAITH_ZONE_TURN_THRESHOLD ? MAX_FAITH_ZONE_EARLY : MAX_FAITH_ZONE;
}

export function getRevealThreshold(cardId: string): number {
  return 3; // default, customize per card
}

export function commitToFaith(game: GameState, playerId: string, cardId: string) {
  const player = game.players[playerId];
  const maxSlots = getMaxFaithZone(game.turn);

  if (player.faithZone.length >= maxSlots) return;

  player.hand = player.hand.filter(c => c !== cardId);

  const faithCard: FaithCard = {
    id: crypto.randomUUID(),
    baseCardId: cardId,
    ownerId: playerId,
    turnsInFaith: 0,
    revealThreshold: getRevealThreshold(cardId),
    state: "CHARGING",
    isHidden: true,
    disrupted: false,
    turnsReadyNotRevealed: 0,
  };

  player.faithZone.push(faithCard);

  // Apply commitment cost
  if (FAITH_COMMIT_COST === "skip_draw") {
    player.skipNextDraw = true;
  } else {
    player.loseManaNextTurn = (player.loseManaNextTurn || 0) + 1;
  }
}

export function advanceFaith(game: GameState, prophetBonus: Record<string, boolean> = {}) {
  Object.entries(game.players).forEach(([playerId, player]) => {
    let prophetApplied = false;
    player.faithZone.forEach(card => {
      if (card.state !== "CHARGING" && card.state !== "READY" && card.state !== "DECAYING") return;

      card.turnsInFaith += 1;

      // Prophets passive: first charging faith card gets +1 extra
      if (prophetBonus[playerId] && card.state === "CHARGING" && !prophetApplied) {
        card.turnsInFaith += 1;
        prophetApplied = true;
      }

      if (card.state === "CHARGING" && card.turnsInFaith >= card.revealThreshold) {
        card.state = "READY";
        card.turnsReadyNotRevealed = 0;
      }

      if (card.state === "READY" || card.state === "DECAYING") {
        card.turnsReadyNotRevealed = (card.turnsReadyNotRevealed || 0) + 1;

        if (card.state === "READY" && card.turnsReadyNotRevealed >= DECAY_AFTER_READY) {
          card.state = "DECAYING";
        }
      }
    });
  });
}

export function revealFaithCard(game: GameState, playerId: string, faithCardId: string) {
  const player = game.players[playerId];
  const card = player.faithZone.find(c => c.id === faithCardId);

  if (!card || (card.state !== "READY" && card.state !== "DECAYING")) return;

  const isDecaying = card.state === "DECAYING";
  card.state = "REVEALED";
  card.isHidden = false;

  triggerCardEffect(game, card, isDecaying);
}

function triggerCardEffect(game: GameState, faithCard: FaithCard, isDecaying: boolean) {
  const { baseCardId, turnsInFaith, ownerId } = faithCard;
  const bonus = isDecaying ? Math.floor(turnsInFaith / 2) : turnsInFaith;

  switch (baseCardId) {
    case "ABRAHAM_TEST":
      if (turnsInFaith >= 3) {
        console.log(`Summon blessing unit (bonus: +${bonus})`);
      }
      break;

    case "RED_SEA":
      console.log(`Destroy all enemies if losing (bonus: ${bonus})`);
      break;

    case "SUDDEN_GRACE":
      console.log(`Heal + Buff (bonus: ${bonus})`);
      break;

    default:
      console.log(`No effect defined (bonus: ${bonus})`);
  }
}

export function applyDoubt(game: GameState, targetPlayerId: string, faithCardId: string) {
  const player = game.players[targetPlayerId];
  const card = player.faithZone.find(c => c.id === faithCardId);

  if (!card) return;

  card.revealThreshold += 2;
  card.disrupted = true;

  if (card.state === "READY" || card.state === "DECAYING") {
    card.state = "CHARGING";
    card.turnsReadyNotRevealed = 0;
  }

  // Cancel check: if exceeded by too much, destroy the card
  const originalThreshold = getRevealThreshold(card.baseCardId);
  if (card.revealThreshold >= originalThreshold + DOUBT_CANCEL_EXTRA * 2 + 2) {
    player.faithZone = player.faithZone.filter(c => c.id !== faithCardId);
    console.log(`Faith card ${card.baseCardId} CANCELLED by overwhelming doubt!`);
  }
}

export function applyPrayer(game: GameState, playerId: string, faithCardId: string) {
  const player = game.players[playerId];
  const card = player.faithZone.find(c => c.id === faithCardId);

  if (!card) return;

  card.turnsInFaith += 1;

  if (card.state === "CHARGING" && card.turnsInFaith >= card.revealThreshold) {
    card.state = "READY";
    card.turnsReadyNotRevealed = 0;
  }
}
