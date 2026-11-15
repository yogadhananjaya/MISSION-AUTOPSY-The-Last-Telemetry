import { initShip, stepShip, REWIND_PARAMS, type Action, type ShipState } from '../src/engine/crisis/shipState';

function runSim(
  actionFn: (s: ShipState) => Action[],
  maxMinutes = 310
): ShipState {
  let s = initShip(REWIND_PARAMS, 1, 180);
  while (!s.over && s.t < maxMinutes) {
    const actions = actionFn(s);
    s = stepShip(s, REWIND_PARAMS, actions);
  }
  return s;
}

let allPass = true;
function check(name: string, ok: boolean, detail: string) {
  if (ok) {
    console.log(`[PASS] ${name}: ${detail}`);
  } else {
    console.error(`[FAIL] ${name}: ${detail}`);
    allPass = false;
  }
}

console.log('--- START ACCEPTANCE TEST Q1 ---');

// R1: tidak bertindak
{
  const s = runSim(() => []);
  const ok = s.outcome === 'failure' && s.reason?.includes('UVLO_TRIP') && Math.abs(s.t - 242) <= 2;
  check('R1 (No action)', ok, `outcome=${s.outcome}, t=${s.t}, reason=${s.reason}`);
}

// R2: hanya heater on di t=185
{
  const s = runSim((st) => (st.t === 185 ? [{ type: 'heater', on: true }] : []));
  const ok = s.outcome === 'failure' && s.reason?.includes('UVLO_TRIP') && Math.abs(s.t - 250) <= 3;
  check('R2 (Heater only at 185)', ok, `outcome=${s.outcome}, t=${s.t}, reason=${s.reason}`);
}

// R3: hanya shed 2 di t=185
{
  const s = runSim((st) => (st.t === 185 ? [{ type: 'shed', level: 2 }] : []));
  const ok = s.outcome === 'failure' && s.reason?.includes('UVLO_TRIP') && Math.abs(s.t - 250) <= 3;
  check('R3 (Shed 2 only at 185)', ok, `outcome=${s.outcome}, t=${s.t}, reason=${s.reason}`);
}

// R5: heater on + shed 2 di t=185 + diagnosis lalu repair setiap kerusakan setelah 4 tik
{
  const s = runSim((st) => {
    const acts: Action[] = [];
    if (st.t === 185) {
      acts.push({ type: 'heater', on: true }, { type: 'shed', level: 2 });
    }
    for (const d of st.damages) {
      if (!d.diagnosed && d.ticksActive >= 2) {
        acts.push({ type: 'diagnose', uid: d.uid });
      } else if (d.diagnosed && d.ticksActive >= 4) {
        acts.push({ type: 'repair', uid: d.uid });
      }
    }
    return acts;
  });
  const ok = s.outcome === 'success' && Math.abs(s.battery.socPct - 48) <= 5;
  check('R5 (Heater + Shed 2 + Repairs)', ok, `outcome=${s.outcome}, SOC=${s.battery.socPct.toFixed(1)}%, t=${s.t}`);
}

// R6: heater+shed1 tanpa memperbaiki brownout
{
  const s = runSim((st) => {
    const acts: Action[] = [];
    if (st.t === 185) {
      acts.push({ type: 'heater', on: true }, { type: 'shed', level: 1 });
    }
    for (const d of st.damages) {
      if (d.defId !== 'cable_brownout') {
        if (!d.diagnosed && d.ticksActive >= 2) acts.push({ type: 'diagnose', uid: d.uid });
        else if (d.diagnosed && d.ticksActive >= 4) acts.push({ type: 'repair', uid: d.uid });
      }
    }
    return acts;
  });
  const ok = s.outcome === 'failure' && s.reason?.includes('UVLO_TRIP') && Math.abs(s.t - 269) <= 4;
  check('R6 (Heater + Shed 1, no brownout repair)', ok, `outcome=${s.outcome}, t=${s.t}, reason=${s.reason}`);
}

// R7: heater baru dinyalakan di t=230
{
  const s = runSim((st) => {
    const acts: Action[] = [];
    if (st.t === 230) acts.push({ type: 'heater', on: true });
    return acts;
  });
  const ok = s.outcome === 'failure';
  check('R7 (Late heater at 230)', ok, `outcome=${s.outcome}, t=${s.t}, reason=${s.reason}`);
}


// R9: heater+shed2 di 185, lalu shed 0 + heater off di t=271, repair seperti R5
{
  const s = runSim((st) => {
    const acts: Action[] = [];
    if (st.t === 185) {
      acts.push({ type: 'heater', on: true }, { type: 'shed', level: 2 });
    }
    if (st.t === 271) {
      acts.push({ type: 'heater', on: false }, { type: 'shed', level: 0 });
    }
    for (const d of st.damages) {
      if (!d.diagnosed && d.ticksActive >= 2) {
        acts.push({ type: 'diagnose', uid: d.uid });
      } else if (d.diagnosed && d.ticksActive >= 4) {
        acts.push({ type: 'repair', uid: d.uid });
      }
    }
    return acts;
  });
  const ok = s.outcome === 'success' && Math.abs(s.battery.socPct - 31) <= 5;
  check('R9 (Recovery after eclipse at 271)', ok, `outcome=${s.outcome}, SOC=${s.battery.socPct.toFixed(1)}%, t=${s.t}`);
}

// Determinisme
{
  const run1 = runSim(() => []);
  const run2 = runSim(() => []);
  const ok = JSON.stringify(run1) === JSON.stringify(run2);
  check('Determinism', ok, `run1 === run2: ${ok}`);
}

// Immutability
{
  const initial = initShip(REWIND_PARAMS, 1, 180);
  const snap = JSON.stringify(initial);
  stepShip(initial, REWIND_PARAMS, [{ type: 'heater', on: true }]);
  const ok = JSON.stringify(initial) === snap;
  check('Immutability', ok, `initial state unmodified: ${ok}`);
}

if (!allPass) {
  process.exit(1);
} else {
  console.log('--- ALL ACCEPTANCE CRITERIA FOR Q1 PASSED! ---');
}
