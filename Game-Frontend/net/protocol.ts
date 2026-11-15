import type { ShipState, Action } from '../engine/crisis/shipState';

export type LobbyStatus = 'WAITING_FOR_PLAYERS' | 'SELECTING_AGENTS' | 'READY' | 'IN_GAME' | 'RESULTS' | 'CLOSED';
export interface PlayerSlot {
  id: string;            // id koneksi (host = 'host')
  name: string;
  agentId: string | null;
  locked: boolean;
  connected: boolean;
  isBot: boolean;
}
export interface Lobby { code: string; status: LobbyStatus; players: PlayerSlot[]; difficulty: 1 | 1.3 | 1.6; seed: number }

export type NetMsg =
  | { t: 'hello'; name: string }                                   // klien -> host
  | { t: 'lobby'; lobby: Lobby }                                   // host -> semua
  | { t: 'agent:select'; agentId: string }                         // klien -> host
  | { t: 'agent:lock' }                                            // klien -> host
  | { t: 'agent:unlock' }                                          // klien -> host (selama belum start)
  | { t: 'game:start'; seed: number; difficulty: number }          // host -> semua
  | { t: 'ship'; state: ShipState; claims: Record<number, string> }// host -> semua, 1 Hz
  | { t: 'act'; action: Action; ms?: number }                      // klien -> host
  | { t: 'claim'; uid: number }                                    // klien -> host: "aku kerjakan ini"
  | { t: 'quick'; code: QuickCode }                                // klien -> host -> semua
  | { t: 'quick:fan'; code: QuickCode; from: string }              // host -> semua
  | { t: 'game:over'; results: TeamResults }                       // host -> semua
  | { t: 'error'; message: string };

export type QuickCode = 'POWER_LOW' | 'NEED_DIAG' | 'TAKING_IT' | 'NEED_HELP' | 'DONE' | 'WHICH_FIRST' | 'AGREE' | 'HOLD';
export interface PlayerStats { id: string; name: string; agentId: string; repaired: number; diagnosed: number; wrongRepairs: number; skillUses: number }
export interface TeamResults { survivedMin: number; outcomeReason: string; repaired: number; diagnosed: number; wrongRepairs: number; score: number; players: PlayerStats[] }
