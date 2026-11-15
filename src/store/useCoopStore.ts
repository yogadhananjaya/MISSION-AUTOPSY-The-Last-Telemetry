import { create } from 'zustand';
import type { Transport } from '../net/transport';
import type { Lobby, PlayerSlot, TeamResults, QuickCode } from '../net/protocol';
import type { ShipState, Action } from '../engine/crisis/shipState';
import { PeerTransport } from '../net/peerTransport';
import { BroadcastTransport } from '../net/broadcastTransport';
import { makeLobbyCode, normalizeCode } from '../net/code';
import { AGENTS } from '../data/agents';

export type TransportKind = 'peer' | 'broadcast';

export interface QuickBubble {
  id: string;
  code: QuickCode;
  from: string;
  timestamp: number;
}

export interface CoopState {
  role: 'none' | 'host' | 'client';
  transport: Transport | null;
  lobby: Lobby | null;
  selfId: string;
  playerName: string;
  error: string | null;
  transportKind: TransportKind;

  // Q5 Live Game state
  ship: ShipState | null;
  claims: Record<number, string>; // uid -> player id
  quickMessages: QuickBubble[];
  results: TeamResults | null;

  // Host internal
  setDifficulty: (diff: 1 | 1.3 | 1.6) => void;

  // Actions
  createLobby: (name: string, kind?: TransportKind) => Promise<void>;
  joinLobby: (name: string, code: string, kind?: TransportKind) => Promise<void>;
  selectAgent: (agentId: string) => void;
  lockIn: () => void;
  unlock: () => void;
  startGame: () => void;
  sendAction: (action: Action, ms?: number) => void;
  claimTask: (uid: number) => void;
  sendQuickComm: (code: QuickCode) => void;
  leave: () => void;
  clearError: () => void;

  // Internal updater from network
  setShipState: (s: ShipState, claims: Record<number, string>) => void;
  setResults: (res: TeamResults) => void;
  pushQuickBubble: (code: QuickCode, from: string) => void;
}

export const useCoopStore = create<CoopState>((set, get) => ({
  role: 'none',
  transport: null,
  lobby: null,
  selfId: '',
  playerName: '',
  error: null,
  transportKind: 'peer',

  ship: null,
  claims: {},
  quickMessages: [],
  results: null,

  setDifficulty: (diff) => {
    const { lobby, role, transport } = get();
    if (role !== 'host' || !lobby) return;
    const nextLobby = { ...lobby, difficulty: diff };
    set({ lobby: nextLobby });
    transport?.send({ t: 'lobby', lobby: nextLobby });
  },

  clearError: () => set({ error: null }),

  createLobby: async (name, kind = 'peer') => {
    get().leave();
    const cleanName = (name.trim() || 'Commander').slice(0, 16);
    const code = makeLobbyCode();
    const transport: Transport = kind === 'peer' ? new PeerTransport() : new BroadcastTransport();

    try {
      await transport.host(code);
    } catch (err: any) {
      set({ error: err.message || 'Gagal membuat server lobi.' });
      return;
    }

    const initialLobby: Lobby = {
      code,
      status: 'SELECTING_AGENTS',
      difficulty: 1.3,
      seed: Math.floor(Math.random() * 1000000),
      players: [
        {
          id: transport.selfId,
          name: cleanName,
          agentId: null,
          locked: false,
          connected: true,
          isBot: false,
        },
      ],
    };

    // Setup host message handling
    transport.onMessage((msg, fromPeerId) => {
      const current = get().lobby;
      if (!current) return;

      if (msg.t === 'hello') {
        // Player joins
        if (current.status === 'IN_GAME') {
          // Reconnect attempt?
          const existingSlot = current.players.find((p) => p.name === msg.name && !p.connected);
          if (existingSlot) {
            existingSlot.id = fromPeerId;
            existingSlot.connected = true;
            existingSlot.isBot = false;
            set({ lobby: { ...current } });
            transport.send({ t: 'lobby', lobby: current });
            return;
          }
          transport.sendTo(fromPeerId, { t: 'error', message: 'Permainan sedang berlangsung.' });
          return;
        }

        const humanCount = current.players.filter((p) => !p.isBot).length;
        if (humanCount >= 4) {
          transport.sendTo(fromPeerId, { t: 'error', message: 'Lobi sudah penuh (maks 4 pemain).' });
          return;
        }

        const newPlayer: PlayerSlot = {
          id: fromPeerId,
          name: (msg.name || 'Astronaut').slice(0, 16),
          agentId: null,
          locked: false,
          connected: true,
          isBot: false,
        };
        const nextLobby = {
          ...current,
          players: [...current.players.filter((p) => p.id !== fromPeerId), newPlayer],
        };
        set({ lobby: nextLobby });
        transport.send({ t: 'lobby', lobby: nextLobby });
      } else if (msg.t === 'agent:select') {
        // Validation Rule 2
        const player = current.players.find((p) => p.id === fromPeerId);
        if (!player || player.locked) return;
        const alreadyTaken = current.players.some(
          (p) => p.agentId === msg.agentId && p.id !== fromPeerId
        );
        if (alreadyTaken) {
          transport.sendTo(fromPeerId, {
            t: 'error',
            message: 'Agent ini sudah dipilih oleh rekan setim.',
          });
          return;
        }
        player.agentId = msg.agentId;
        const nextLobby = { ...current };
        set({ lobby: nextLobby });
        transport.send({ t: 'lobby', lobby: nextLobby });
      } else if (msg.t === 'agent:lock') {
        // Validation Rule 3
        const player = current.players.find((p) => p.id === fromPeerId);
        if (player && player.agentId) {
          player.locked = true;
          const nextLobby = { ...current };
          set({ lobby: nextLobby });
          transport.send({ t: 'lobby', lobby: nextLobby });
        }
      } else if (msg.t === 'agent:unlock') {
        const player = current.players.find((p) => p.id === fromPeerId);
        if (player && current.status !== 'IN_GAME') {
          player.locked = false;
          const nextLobby = { ...current };
          set({ lobby: nextLobby });
          transport.send({ t: 'lobby', lobby: nextLobby });
        }
      } else if (msg.t === 'quick') {
        // Fan out quick message
        const sender = current.players.find((p) => p.id === fromPeerId)?.name || 'Astronaut';
        transport.send({ t: 'quick:fan', code: msg.code, from: sender });
        get().pushQuickBubble(msg.code, sender);
      }
    });

    transport.onPeerLeave((peerId) => {
      const current = get().lobby;
      if (!current) return;
      if (current.status === 'IN_GAME') {
        const slot = current.players.find((p) => p.id === peerId);
        if (slot) {
          slot.connected = false;
          slot.isBot = true; // Bot takes over
          set({ lobby: { ...current } });
          transport.send({ t: 'lobby', lobby: current });
        }
      } else {
        const nextLobby = {
          ...current,
          players: current.players.filter((p) => p.id !== peerId),
        };
        set({ lobby: nextLobby });
        transport.send({ t: 'lobby', lobby: nextLobby });
      }
    });

    set({
      role: 'host',
      transport,
      lobby: initialLobby,
      selfId: transport.selfId,
      playerName: cleanName,
      transportKind: kind,
      error: null,
      ship: null,
      claims: {},
      results: null,
    });
  },

  joinLobby: async (name, rawCode, kind = 'peer') => {
    get().leave();
    const cleanName = (name.trim() || 'Cadet').slice(0, 16);
    const code = normalizeCode(rawCode);
    const transport: Transport = kind === 'peer' ? new PeerTransport() : new BroadcastTransport();

    try {
      await transport.join(code);
    } catch (err: any) {
      set({ error: err.message || 'Gagal terhubung ke lobi.' });
      return;
    }

    // Client message handling
    transport.onMessage((msg) => {
      if (msg.t === 'lobby') {
        set({ lobby: msg.lobby });
      } else if (msg.t === 'ship') {
        set({ ship: msg.state, claims: msg.claims });
      } else if (msg.t === 'quick:fan') {
        get().pushQuickBubble(msg.code, msg.from);
      } else if (msg.t === 'game:over') {
        set({ results: msg.results });
      } else if (msg.t === 'error') {
        set({ error: msg.message });
      }
    });

    // Send hello to host
    transport.send({ t: 'hello', name: cleanName });

    set({
      role: 'client',
      transport,
      selfId: transport.selfId,
      playerName: cleanName,
      transportKind: kind,
      error: null,
      ship: null,
      claims: {},
      results: null,
    });
  },

  selectAgent: (agentId) => {
    const { role, transport, lobby, selfId } = get();
    if (!lobby || !transport) return;

    if (role === 'host') {
      const player = lobby.players.find((p) => p.id === selfId);
      if (!player || player.locked) return;
      const alreadyTaken = lobby.players.some((p) => p.agentId === agentId && p.id !== selfId);
      if (alreadyTaken) return;
      player.agentId = agentId;
      const nextLobby = { ...lobby };
      set({ lobby: nextLobby });
      transport.send({ t: 'lobby', lobby: nextLobby });
    } else {
      transport.send({ t: 'agent:select', agentId });
    }
  },

  lockIn: () => {
    const { role, transport, lobby, selfId } = get();
    if (!lobby || !transport) return;

    if (role === 'host') {
      const player = lobby.players.find((p) => p.id === selfId);
      if (player && player.agentId) {
        player.locked = true;
        const nextLobby = { ...lobby };
        set({ lobby: nextLobby });
        transport.send({ t: 'lobby', lobby: nextLobby });
      }
    } else {
      transport.send({ t: 'agent:lock' });
    }
  },

  unlock: () => {
    const { role, transport, lobby, selfId } = get();
    if (!lobby || !transport || lobby.status === 'IN_GAME') return;

    if (role === 'host') {
      const player = lobby.players.find((p) => p.id === selfId);
      if (player) {
        player.locked = false;
        const nextLobby = { ...lobby };
        set({ lobby: nextLobby });
        transport.send({ t: 'lobby', lobby: nextLobby });
      }
    } else {
      transport.send({ t: 'agent:unlock' });
    }
  },

  startGame: () => {
    const { role, lobby, transport } = get();
    if (role !== 'host' || !lobby || !transport) return;

    // Check all humans locked
    const humanPlayers = lobby.players.filter((p) => !p.isBot);
    const allLocked = humanPlayers.every((p) => p.locked && p.agentId);
    if (!allLocked) {
      set({ error: 'Semua pemain manusia wajib memilih agent dan Lock In terlebih dahulu.' });
      return;
    }

    // Fill up to 4 slots with bots
    const usedAgentIds = new Set(lobby.players.map((p) => p.agentId));
    const availableAgents = AGENTS.filter((a) => !usedAgentIds.has(a.id));

    const finalPlayers: PlayerSlot[] = [...lobby.players];
    let botIndex = 1;
    while (finalPlayers.length < 4 && availableAgents.length > 0) {
      const chosenAgent = availableAgents.splice(
        Math.floor(Math.random() * availableAgents.length),
        1
      )[0];
      finalPlayers.push({
        id: `bot-${botIndex}`,
        name: `BOT ${chosenAgent.name.split(' ')[0]}`,
        agentId: chosenAgent.id,
        locked: true,
        connected: true,
        isBot: true,
      });
      botIndex++;
    }

    const updatedLobby: Lobby = {
      ...lobby,
      status: 'IN_GAME',
      players: finalPlayers,
    };

    set({ lobby: updatedLobby, error: null });
    transport.send({ t: 'lobby', lobby: updatedLobby });
    transport.send({ t: 'game:start', seed: updatedLobby.seed, difficulty: updatedLobby.difficulty });
  },

  sendAction: (action, ms) => {
    const { transport } = get();
    transport?.send({ t: 'act', action, ms });
  },

  claimTask: (uid) => {
    const { transport } = get();
    transport?.send({ t: 'claim', uid });
  },

  sendQuickComm: (code) => {
    const { transport, playerName } = get();
    transport?.send({ t: 'quick', code });
    get().pushQuickBubble(code, playerName || 'Me');
  },

  leave: () => {
    const { transport } = get();
    transport?.close();
    set({
      role: 'none',
      transport: null,
      lobby: null,
      selfId: '',
      error: null,
      ship: null,
      claims: {},
      quickMessages: [],
      results: null,
    });
  },

  setShipState: (ship, claims) => set({ ship, claims }),
  setResults: (results) => set({ results }),
  pushQuickBubble: (code, from) => {
    const newBubble: QuickBubble = {
      id: `${Date.now()}-${Math.random()}`,
      code,
      from,
      timestamp: Date.now(),
    };
    set((s) => ({
      quickMessages: [...s.quickMessages.slice(-5), newBubble],
    }));

    setTimeout(() => {
      set((s) => ({
        quickMessages: s.quickMessages.filter((m) => m.id !== newBubble.id),
      }));
    }, 4000);
  },
}));
