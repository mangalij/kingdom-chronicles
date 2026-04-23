import { FaithCard } from "./FaithCard";

export interface PlayerState {
  id: string;
  health: number;
  hand: string[];
  board: string[];
  faithZone: FaithCard[];
  skipNextDraw: boolean;
  loseManaNextTurn: number;
  cardsPlayedThisTurn: number;
  heroesPlayedThisTurn: number;
  angelsReviveUsed: boolean;
  factionEffectsLog: string[];
}

export interface GameState {
  turn: number;
  activePlayerId: string;
  players: Record<string, PlayerState>;
}
