import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles
} from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { AGENTS, type RoleGroup } from '../../data/agents';
import { sounds } from '../../utils/soundEngine';

interface StationPanelProps {
  onTriggerSkill: () => void;
  skillCooldownRemaining: number;
}

export const StationPanel: React.FC<StationPanelProps> = ({
  onTriggerSkill,
  skillCooldownRemaining,
}) => {
  const { ship, selfId, lobby, sendAction } = useCoopStore();

  const myPlayer = lobby?.players.find((p) => p.id === selfId);
  const myAgent = AGENTS.find((a) => a.id === myPlayer?.agentId) || AGENTS[0];
  const roleGroup: RoleGroup = myAgent.roleGroup;

  const [diagCooldown, setDiagCooldown] = useState(false);

  const handleToggleHeater = () => {
    if (!ship) return;
    sounds.playClick(600);
    sendAction({ type: 'heater', on: !ship.heaterOn });
  };

  const handleShed = (level: 0 | 1 | 2) => {
    sounds.playClick(600);
    sendAction({ type: 'shed', level });
  };

  const handleDiagnose = (uid: number) => {
    if (diagCooldown) return;
    sounds.playClick(700);
    sendAction({ type: 'diagnose', uid });
    setDiagCooldown(true);
    setTimeout(() => setDiagCooldown(false), 3000);
  };

  if (!ship) return null;

  return (
    <div className="bg-[#141619] border border-black p-4 rounded-2xl shadow-xl space-y-4 font-mono text-xs select-none">
      {/* Station Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold text-amber-400 uppercase tracking-wider">
            KONSOL STASIUN: [{roleGroup.toUpperCase()}]
          </span>
          <span className="text-gray-400 text-[11px]">— {myAgent.name}</span>
        </div>

        {/* Active Skill Trigger */}
        <button
          type="button"
          disabled={skillCooldownRemaining > 0}
          onClick={onTriggerSkill}
          className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black font-display text-[11px] tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {skillCooldownRemaining > 0
              ? `SKILL (${skillCooldownRemaining}s)`
              : `SKILL: ${myAgent.active.name}`}
          </span>
        </button>
      </div>

      {/* Role Group Specific Console Views */}
      {roleGroup === 'telemetry' && (
        <div className="space-y-3">
          <div className="text-[10px] text-purple-400 uppercase font-bold">
            TELEMETRY DIAGNOSTIC SUITE & RAW SENSOR METRICS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">BUS VOLTAGE</span>
              <span className={`text-base font-bold ${ship.battery.busV < 22.5 ? 'text-red-400' : 'text-amber-400'}`}>
                {ship.battery.busV.toFixed(2)} V
              </span>
            </div>
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">BATTERY SOC</span>
              <span className="text-base font-bold text-green-400">{ship.battery.socPct.toFixed(1)}%</span>
            </div>
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">CELL TEMP</span>
              <span className={`text-base font-bold ${ship.battery.tempC < -10 ? 'text-red-400' : 'text-cyan-400'}`}>
                {ship.battery.tempC.toFixed(1)}°C
              </span>
            </div>
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">CRISIS PHASE</span>
              <span className="text-base font-bold text-purple-400">FASE {ship.phase} / 5</span>
            </div>
          </div>

          {/* Undiagnosed damages quick diagnose */}
          {ship.damages.some((d) => !d.diagnosed) && (
            <div className="p-2 bg-purple-950/30 border border-purple-500/50 rounded-lg flex items-center justify-between">
              <span className="text-purple-300 text-[11px]">
                Anomali terdeteksi belum terdiagnosis:
              </span>
              <div className="flex gap-2">
                {ship.damages.filter((d) => !d.diagnosed).map((d) => (
                  <button
                    key={d.uid}
                    type="button"
                    disabled={diagCooldown}
                    onClick={() => handleDiagnose(d.uid)}
                    className="px-2 py-1 bg-purple-500 hover:bg-purple-400 text-black font-bold text-[10px] rounded cursor-pointer"
                  >
                    DIAGNOSE #{d.uid}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {roleGroup === 'electrical' && (
        <div className="space-y-3">
          <div className="text-[10px] text-yellow-400 uppercase font-bold">
            EPS POWER BUS & THERMAL HEATER CONTROLS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Heater */}
            <button
              type="button"
              onClick={handleToggleHeater}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                ship.heaterOn
                  ? 'bg-amber-950/40 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                  : 'bg-black/50 border-gray-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${ship.heaterOn ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`} />
                <span>PEMANAS BATERAI (25W)</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-black ${ship.heaterOn ? 'bg-amber-400 text-black' : 'bg-gray-800 text-gray-400'}`}>
                {ship.heaterOn ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Shedding */}
            <div className="bg-black/50 border border-gray-800 p-2.5 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 uppercase mb-1">LOAD SHEDDING LEVEL:</span>
              <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleShed(lvl as 0 | 1 | 2)}
                    className={`py-1 rounded border text-[10px] font-bold cursor-pointer ${
                      ship.shedLevel === lvl
                        ? 'border-yellow-400 bg-yellow-950/40 text-yellow-300'
                        : 'border-gray-800 bg-gray-900 text-gray-500'
                    }`}
                  >
                    Level {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {roleGroup === 'mechanical' && (
        <div className="space-y-3">
          <div className="text-[10px] text-cyan-400 uppercase font-bold">
            PROPULSION & LIFE SUPPORT SUBSYSTEM TELEMETRY
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">PROPULSION</span>
              <span className="text-base font-bold text-cyan-400">{ship.systems.propulsion.toFixed(0)}%</span>
            </div>
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">LIFE SUPPORT</span>
              <span className="text-base font-bold text-emerald-400">{ship.systems.life.toFixed(0)}%</span>
            </div>
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">HULL INTEGRITY</span>
              <span className="text-base font-bold text-red-400">{ship.systems.hull.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {roleGroup === 'systems' && (
        <div className="space-y-3">
          <div className="text-[10px] text-emerald-400 uppercase font-bold">
            DEEP SPACE COMMS & AVIONICS NAVIGATION BUS
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">COMMUNICATIONS (DSN)</span>
              <span className="text-base font-bold text-emerald-400">{ship.systems.comms.toFixed(0)}%</span>
            </div>
            <div className="p-2.5 bg-black/60 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-500 block">NAVIGATION & ADCS</span>
              <span className="text-base font-bold text-yellow-400">{ship.systems.nav.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
