import type { ShipState, Action, ShipParams } from '../engine/crisis/shipState';
import { DAMAGE_DEFS, type MinigameId } from '../engine/crisis/damageGraph';
import { minutesToEclipse, inEclipse } from '../engine/crisis/shipState';
import type { PlayerSlot } from '../net/protocol';
import { AGENTS, type RoleGroup } from '../data/agents';

interface BotMemory {
  targetUid: number | null;
  startedTick: number;
  requiredTicks: number;
  actionType: 'diagnose' | 'repair';
}

const botMemories: Map<string, BotMemory> = new Map();

// Match minigame to preferred roleGroup
function minigameMatchesRole(mg: MinigameId, roleGroup: RoleGroup): boolean {
  if (roleGroup === 'electrical') return mg === 'routing' || mg === 'cable';
  if (roleGroup === 'mechanical') return mg === 'calibrate' || mg === 'cable';
  if (roleGroup === 'systems') return mg === 'antenna' || mg === 'calibrate';
  return false;
}

export function stepBots(
  state: ShipState,
  params: ShipParams,
  players: PlayerSlot[],
  claims: Record<number, string>
): { actions: { action: Action; fromId: string; ms?: number }[]; claimsToTake: { uid: number; botId: string }[] } {
  const resultActions: { action: Action; fromId: string; ms?: number }[] = [];
  const claimsToTake: { uid: number; botId: string }[] = [];

  const bots = players.filter((p) => p.isBot || !p.connected);

  for (const bot of bots) {
    const agent = AGENTS.find((a) => a.id === bot.agentId);
    const roleGroup = agent?.roleGroup ?? 'mechanical';

    // 1. Electrical bot automatic heater management
    if (roleGroup === 'electrical') {
      const minToEcl = minutesToEclipse(params, state.t);
      const isEcl = inEclipse(params, state.t);

      if (minToEcl > 0 && minToEcl <= 25 && !state.heaterOn) {
        resultActions.push({ action: { type: 'heater', on: true }, fromId: bot.id });
      } else if (!isEcl && minToEcl > 30 && state.heaterOn) {
        resultActions.push({ action: { type: 'heater', on: false }, fromId: bot.id });
      }
    }

    let mem = botMemories.get(bot.id);

    // Verify if current target is still active
    if (mem && !state.damages.some((d) => d.uid === mem?.targetUid)) {
      mem = undefined;
      botMemories.delete(bot.id);
    }

    if (mem) {
      // In progress
      const elapsedTicks = state.tickCount - mem.startedTick;
      if (elapsedTicks >= mem.requiredTicks) {
        // Complete action!
        if (mem.actionType === 'diagnose') {
          resultActions.push({
            action: { type: 'diagnose', uid: mem.targetUid! },
            fromId: bot.id,
          });
        } else if (mem.actionType === 'repair') {
          const def = DAMAGE_DEFS[state.damages.find((d) => d.uid === mem!.targetUid)?.defId || ''];
          const baseSec = def?.baseSec ?? 14;
          resultActions.push({
            action: { type: 'repair', uid: mem.targetUid! },
            fromId: bot.id,
            ms: Math.round((baseSec / 0.6) * 1000),
          });
        }
        botMemories.delete(bot.id);
      }
    } else {
      // Idle: pick new target
      if (roleGroup === 'telemetry') {
        // Find oldest undiagnosed damage (prioritize non-minor)
        const nonMinorUndiagnosed = state.damages.filter(
          (d) => !d.diagnosed && DAMAGE_DEFS[d.defId]?.severity !== 'minor'
        );
        const minorUndiagnosed = state.damages.filter(
          (d) => !d.diagnosed && DAMAGE_DEFS[d.defId]?.severity === 'minor'
        );
        const target = nonMinorUndiagnosed[0] || minorUndiagnosed[0];

        if (target) {
          // Delay 6 to 10 ticks
          const delay = 6 + (state.tickCount % 5);
          botMemories.set(bot.id, {
            targetUid: target.uid,
            startedTick: state.tickCount,
            requiredTicks: delay,
            actionType: 'diagnose',
          });
        }
      } else {
        // Other role: claim and repair diagnosed damages matching roleGroup
        // Prioritize non-minor
        const nonMinorDiagnosed = state.damages.filter(
          (d) =>
            d.diagnosed &&
            DAMAGE_DEFS[d.defId]?.severity !== 'minor' &&
            (!claims[d.uid] || claims[d.uid] === bot.id) &&
            minigameMatchesRole(DAMAGE_DEFS[d.defId]?.minigame, roleGroup)
        );

        const minorDiagnosed = state.damages.filter(
          (d) =>
            d.diagnosed &&
            DAMAGE_DEFS[d.defId]?.severity === 'minor' &&
            (!claims[d.uid] || claims[d.uid] === bot.id) &&
            minigameMatchesRole(DAMAGE_DEFS[d.defId]?.minigame, roleGroup)
        );

        const candidate = nonMinorDiagnosed[0] || minorDiagnosed[0];

        if (candidate) {
          const def = DAMAGE_DEFS[candidate.defId];
          const baseSec = def?.baseSec ?? 14;
          const repairTicks = Math.ceil(baseSec / 0.6); // 60% efficiency

          claimsToTake.push({ uid: candidate.uid, botId: bot.id });
          botMemories.set(bot.id, {
            targetUid: candidate.uid,
            startedTick: state.tickCount,
            requiredTicks: repairTicks,
            actionType: 'repair',
          });
        }
      }
    }
  }

  return { actions: resultActions, claimsToTake };
}
