/* antislop: Centralized feature flagging system to prevent half-baked AI slop from reaching production */
export const FEATURES = {
  rewind: true,          // Q3
  coop: true,            // Q4-Q5
  comic: true,           // Q8
  shipHotspots: true,    // Q9
  diagnosisGrades: true, // Q10
  spaceMap: true,        // Q12b
  episodes2to6: true,    // Q12b
  extraMinigames: false, // Q11b
  agentPoses: true,      // Q11
  music: true,           // Q12
  voiceNova: true,       // Q12
  uiTheme: true,         // Q13
  leaderboardLocal: true,// Q15
  leaderboardGlobal: false,  // Q15 (butuh SUPABASE)
  rewards: false,        // Q18
  tutorial: false,       // Q20
  i18n: false,           // Q21
  publicMatchmaking: false,  // Q16 (butuh SUPABASE)
  voiceChat: false,      // Q17
  ghostReplay: true,     // Q19
  shareCard: true,       // Q19
  learnedPanel: true,    // Q19
  blackBoxReplay: false, // Q19
  triageVote: false,     // Q19
} as const;
export type FeatureKey = keyof typeof FEATURES;
