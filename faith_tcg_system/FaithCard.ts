export type FaithState = "CHARGING" | "READY" | "REVEALED" | "CANCELLED" | "DISRUPTED" | "DECAYING";

export interface FaithCard {
  id: string;
  baseCardId: string;
  ownerId: string;
  turnsInFaith: number;
  revealThreshold: number;
  state: FaithState;
  isHidden: boolean;
  disrupted: boolean;
  turnsReadyNotRevealed: number;
}
