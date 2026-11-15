export interface MinigameResult { success: boolean; ms: number; score: number } // score 0..100
export interface MinigameProps { difficulty: 1 | 2 | 3; seed: number; onDone: (r: MinigameResult) => void }
