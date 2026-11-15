import type { Transport } from '../net/transport';
import type { Lobby, TeamResults, PlayerStats } from '../net/protocol';
import { 
  initShip, 
  stepShip, 
  LASTSTAND_PARAMS, 
  type ShipState, 
  type Action,
  type ShipParams 
} from '../engine/crisis/shipState';
import { DAMAGE_DEFS } from '../engine/crisis/damageGraph';
import { AGENTS } from '../data/agents';
import { stepBots } from './bots';
import { applySkillEffect, type ActiveBuffs } from './skills';

export interface QueuedClientAction {
  fromPeerId: string;
  action: Action;
  ms?: number;
}

export class HostLoop {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private state: ShipState;
  private params: ShipParams;
  private claims: Map<number, { playerId: string; claimedAtTick: number }> = new Map();
  private pendingActions: QueuedClientAction[] = [];
  private lastDiagnoseTime: Map<string, number> = new Map(); // sender -> timestamp ms
  private playerStats: Map<string, PlayerStats> = new Map();
  private buffs: ActiveBuffs = {
    solarBoostTicks: 0,
    loadReductionTicks: 0,
    dualAuthTicks: 0,
  };
  private lobby: Lobby;
  private transport: Transport;
  private onStateUpdate: (s: ShipState, claims: Record<number, string>) => void;
  private onGameOver: (results: TeamResults) => void;

  constructor(
    lobby: Lobby,
    transport: Transport,
    onStateUpdate: (s: ShipState, claims: Record<number, string>) => void,
    onGameOver: (results: TeamResults) => void
  ) {
    this.lobby = lobby;
    this.transport = transport;
    this.onStateUpdate = onStateUpdate;
    this.onGameOver = onGameOver;
    this.params = {
      ...LASTSTAND_PARAMS,
      spawnScale: lobby.difficulty,
    };
    this.state = initShip(this.params, lobby.seed, 0);

    // Initialize player stats
    for (const p of lobby.players) {
      this.playerStats.set(p.id, {
        id: p.id,
        name: p.name,
        agentId: p.agentId || 'nova',
        repaired: 0,
        diagnosed: 0,
        wrongRepairs: 0,
        skillUses: 0,
      });
    }

    this.start();
  }

  enqueueAction(fromPeerId: string, action: Action, ms?: number) {
    this.pendingActions.push({ fromPeerId, action, ms });
  }

  handleClaim(fromPeerId: string, uid: number) {
    const damage = this.state.damages.find((d) => d.uid === uid);
    if (!damage) return;

    const existing = this.claims.get(uid);
    // Allow claim if unowned, or owned by self, or dual auth active
    if (!existing || existing.playerId === fromPeerId || this.buffs.dualAuthTicks > 0) {
      this.claims.set(uid, { playerId: fromPeerId, claimedAtTick: this.state.tickCount });
    } else {
      this.transport.sendTo(fromPeerId, {
        t: 'error',
        message: 'Kerusakan ini sedang dikerjakan oleh rekan setim.',
      });
    }
  }

  private start() {
    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick() {
    if (this.state.over) {
      this.stop();
      return;
    }

    // 1. Expire claims older than 40 seconds (40 ticks)
    for (const [uid, c] of this.claims.entries()) {
      if (this.state.tickCount - c.claimedAtTick >= 40) {
        this.claims.delete(uid);
      }
    }

    // Clean up claims for damages that no longer exist
    for (const uid of Array.from(this.claims.keys())) {
      if (!this.state.damages.some((d) => d.uid === uid)) {
        this.claims.delete(uid);
      }
    }

    // 2. Decrement buffs
    if (this.buffs.solarBoostTicks > 0) this.buffs.solarBoostTicks--;
    if (this.buffs.loadReductionTicks > 0) this.buffs.loadReductionTicks--;
    if (this.buffs.dualAuthTicks > 0) this.buffs.dualAuthTicks--;

    // Dynamic params with active buffs
    const currentParams: ShipParams = {
      ...this.params,
      solarW: this.buffs.solarBoostTicks > 0 ? this.params.solarW * 1.25 : this.params.solarW,
      idleW: this.buffs.loadReductionTicks > 0 ? this.params.idleW * 0.8 : this.params.idleW,
    };

    // 3. Process bot actions & claims
    const currentClaimsObj: Record<number, string> = {};
    this.claims.forEach((v, k) => (currentClaimsObj[k] = v.playerId));

    const botResult = stepBots(this.state, currentParams, this.lobby.players, currentClaimsObj);
    for (const c of botResult.claimsToTake) {
      this.claims.set(c.uid, { playerId: c.botId, claimedAtTick: this.state.tickCount });
    }
    for (const bAct of botResult.actions) {
      this.pendingActions.push({
        fromPeerId: bAct.fromId,
        action: bAct.action,
        ms: bAct.ms,
      });
    }

    // 4. Validate and execute actions
    const validShipActions: Action[] = [];
    const nowMs = Date.now();

    for (const q of this.pendingActions) {
      const player = this.lobby.players.find((p) => p.id === q.fromPeerId);
      const agent = AGENTS.find((a) => a.id === player?.agentId);
      const roleGroup = agent?.roleGroup ?? 'mechanical';
      const stats = this.playerStats.get(q.fromPeerId);

      if (q.action.type === 'diagnose') {
        // Validation: Must be telemetry or bot
        const lastDiag = this.lastDiagnoseTime.get(q.fromPeerId) || 0;
        if (roleGroup !== 'telemetry' && !player?.isBot) {
          this.transport.sendTo(q.fromPeerId, {
            t: 'error',
            message: 'Hanya Telemetry Analyst yang dapat melakukan diagnosis.',
          });
          continue;
        }
        if (nowMs - lastDiag < 3000 && !player?.isBot) {
          continue; // Cooldown
        }
        this.lastDiagnoseTime.set(q.fromPeerId, nowMs);
        if (stats) stats.diagnosed++;
        validShipActions.push(q.action);
      } else if (q.action.type === 'repair') {
        // Validation: must claim first and meet anti-cheat ms
        const claim = this.claims.get(q.action.uid);
        const dmg = this.state.damages.find((d) => d.uid === (q.action as any).uid);
        if (!dmg) continue;

        const def = DAMAGE_DEFS[dmg.defId];
        const minMs = 0.5 * (def?.baseSec ?? 14) * 1000;

        if (claim?.playerId !== q.fromPeerId && this.buffs.dualAuthTicks <= 0 && !player?.isBot) {
          this.transport.sendTo(q.fromPeerId, {
            t: 'error',
            message: 'Kamu harus mengklaim kerusakan ini sebelum memperbaikinya.',
          });
          continue;
        }

        if (q.ms !== undefined && q.ms < minMs && !player?.isBot) {
          // Anti cheat threshold
          continue;
        }

        if (!dmg.diagnosed || (def?.requiresPower && this.state.systems.power < def.requiresPower)) {
          if (stats) stats.wrongRepairs++;
        } else {
          if (stats) stats.repaired++;
        }

        validShipActions.push(q.action);
        this.claims.delete(q.action.uid);
      } else if (q.action.type === 'heater' || q.action.type === 'shed') {
        // Validation: role electrical or mechanical
        if (roleGroup !== 'electrical' && roleGroup !== 'mechanical' && !player?.isBot) {
          this.transport.sendTo(q.fromPeerId, {
            t: 'error',
            message: 'Hanya Teknisi Kelistrikan & Mekanikal yang berwenang mengatur daya.',
          });
          continue;
        }
        validShipActions.push(q.action);
      } else if (q.action.type === 'boost') {
        // Active skill application
        if (stats) stats.skillUses++;
        const skillRes = applySkillEffect(agent?.active.effect || '', this.state, this.buffs);
        this.state = skillRes.state;
        if (skillRes.message) {
          this.state.events.push(skillRes.message);
        }
      }
    }

    this.pendingActions = [];

    // 5. Step simulation engine
    this.state = stepShip(this.state, currentParams, validShipActions);

    // Sync claims map to plain object
    const finalClaimsObj: Record<number, string> = {};
    this.claims.forEach((v, k) => (finalClaimsObj[k] = v.playerId));

    // 6. Broadcast state
    this.transport.send({
      t: 'ship',
      state: this.state,
      claims: finalClaimsObj,
    });
    this.onStateUpdate(this.state, finalClaimsObj);

    // 7. Check Game Over
    if (this.state.over) {
      this.stop();
      const survivedMin = Number((this.state.tickCount / 60).toFixed(1));
      const score = Math.max(
        0,
        Math.round(
          survivedMin * 10 +
            this.state.stats.repaired * 50 +
            this.state.stats.diagnosed * 20 -
            this.state.stats.wrongRepairs * 30 +
            this.state.stats.science
        )
      );

      const teamResults: TeamResults = {
        survivedMin,
        outcomeReason: this.state.reason || 'Krisis terselesaikan.',
        repaired: this.state.stats.repaired,
        diagnosed: this.state.stats.diagnosed,
        wrongRepairs: this.state.stats.wrongRepairs,
        score,
        players: Array.from(this.playerStats.values()),
      };

      this.transport.send({
        t: 'game:over',
        results: teamResults,
      });
      this.onGameOver(teamResults);
    }
  }
}
