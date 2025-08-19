# ASI-ARCH (Tanks) — Gap Analysis and Implementation Plan

Date: 2025-08-19
Scope: AlphaTanks (browser-based tank AI), focusing on `asi-arch-modules.js`, `llm-enhanced-asi-arch.js`, `game-engine.js`, `tank-ai.js`, and LLM integration.

## TL;DR
The current app is a strong, working adaptation of ASI-ARCH: all four roles exist, composite fitness (quant/qual/innovation) is implemented, battles run in a real simulator, and a Red-Queen arms race is modeled. One simulation runs at a time (single-sim constraint). To better match the paper while respecting the Red Queen and single-sim runtime, implement: (1) top-50 candidate pool with batch selection policy but serialized evaluation via an explicit queue/lock, (2) lightweight verification gating using held-out seeds/scenarios within the single-phase loop (no separate two-phase orchestrator), (3) novelty/degeneracy checks, (4) richer cognition base and persistent analysis memory, (5) persistent experiment artifacts, and (6) judge calibration and drift monitoring. Also remove the hard-coded API key and switch to secure config.

---

## Review Summary

- Overall verdict: Good-faith, functional ASI-ARCH demo for tanks.
- Works well:
  - Four modules: Researcher, Engineer, Analyst, Cognition.
  - Composite fitness with LLM-as-judge and innovation term.
  - Game-engine-backed evaluation with tactical metrics; Red-Queen dynamics.
- Key divergences vs. paper:
  - Candidate pool size/policy (`10` vs. `50`; no explicit batch updates).
  - No explicit two-phase exploration→verification pipeline (intentionally omitted for Red Queen single-phase dynamics; use in-loop verification gating instead).
  - Limited novelty/sanity checks; small cognition base; simulated scoring paths exist.
  - No persistent replay set; limited judge calibration; hard-coded API key in `config.js`.

### Evidence Pointers
- Researcher: `asi-arch-modules.js` (TankResearcher: `proposeExperiment`, `applyCognition`, `applyCounterEvolution`) and `enhanced-asi-arch.js`.
- Engineer: `asi-arch-modules.js` (TankEngineer: `runBattle`, `evaluateGenomePerformance`); `game-engine.js` (loop, metrics, battleEnd).
- Analyst: `asi-arch-modules.js` (TankAnalyst: `analyzeResults`, trend/emergent helpers).
- LLM pipeline and fitness: `llm-enhanced-asi-arch.js` (`runExperimentCycle`, `updateCandidatePool`, `generateProposals`, `evaluateProposals`, `calculateCompositeFitness`).
- LLM client/config: `deepseek-client.js`, `config.js` (fitness weights, candidate pool size, mock mode).

---

## Implementation Roadmap (phased)
Each task lists target files, concrete edits, and acceptance criteria. Preserve public APIs unless a change is explicit here.

Note on single-simulation constraint: All evaluations must be serialized. “Batch” refers to selection/pruning policy, not concurrent battles. Implement an evaluation queue and a process-wide lock so only one battle runs at a time.

### Phase 1 — Security + Config Baseline
1) Remove hard-coded API key and support secure configuration
- Files: `config.js`, `deepseek-client.js`.
- Edits:
  - Replace inline key with an empty default and comment; read from env (Node) or a server-side proxy.
  - Add a note in `README.md` about `DEEPSEEK_API_KEY` or proxy.
- Acceptance:
  - No API key in repo.
  - Mock mode works without key; real calls succeed via env/proxy.

2) Parameterize candidate pool size and batch settings in config
- Files: `config.js`, `llm-enhanced-asi-arch.js`.
- Edits:
  - Set `asiArch.candidatePoolSize = 50` (config-driven).
  - Add `asiArch.batchUpdateSize` (e.g., 10) for batched pool updates (selection/pruning only; evaluations are serialized).
- Acceptance: `updateCandidatePool` respects sizes; evaluation queue enforces single active battle; tests pass.

### Phase 2 — Enhanced Battle Scenarios (Single-Phase Red Queen) — COMPLETED
3) ~~Add explicit two-phase cycle orchestration~~ (SKIPPED — Not suitable for Red Queen dynamics)

4) Enhanced battle scenarios and seeded evaluation — DONE
- Files: `game-engine.js`, `llm-enhanced-asi-arch.js`, `config.js`.
- Implemented:
  - Deterministic seeding hooks (obstacles/hill/RNG/tank positions) via init params.
  - Multiple scenario presets with varied tactical challenges (open field, urban, chokepoints).
  - Scenario rotation for diverse evaluation within single-phase evolution.
  - Multi-scenario fitness aggregation to reward adaptable strategies.
- Acceptance: Identical seeds+scenario IDs → reproducible stats; teams face varied tactical challenges.

### Phase 3 — Novelty and Sanity Checks
5) Implement novelty/diversity metrics and degeneracy filter
- Files: `llm-enhanced-asi-arch.js`, `enhanced-asi-arch.js`.
- Edits:
  - Compute genome distance; maintain diversity score; enforce diversity floor.
  - Degeneracy heuristics (extreme parameter collapse) to reject pre-verification.
- Acceptance: Pool maintains diversity; degenerate genomes filtered.

6) Complexity/behavior sanity constraints
- Files: `asi-arch-modules.js`, `tank-ai.js`.
- Edits:
  - Add simple complexity limits (e.g., max fire-rate × accuracy bound; oscillation checks).
  - Analyst reports track violations.
- Acceptance: Violations flagged/rejected; reasons logged.

### Phase 4 — Cognition and Analysis Memory
7) Expand cognition base and add targeted retrieval
- Files: new `cognition/tactics.json`, `llm-enhanced-asi-arch.js`, `asi-arch-modules.js`.
- Edits:
  - Move tactics to JSON; expand: `scenario`, `pattern`, `parameters`, `evidence`.
  - Retrieval by context (map features, opponent stats) before `applyCognition`/prompts.
- Acceptance: JSON loaded; retrieval metrics show relevant matches.

8) Persist Analyst insights and Cognition updates
- Files: `llm-enhanced-asi-arch.js`, new `storage/persist.js`.
- Edits:
  - Serialize history, pool, insights, cognition adjustments.
  - Export/import via `ASIArchIntegration` to restore sessions.
- Acceptance: Reload resumes prior state; export artifact opens cleanly.

### Phase 5 — Robust Verification and Persistence
9) Remove simulated scoring paths
- Files: `llm-enhanced-asi-arch.js`.
- Edits:
  - Ensure evaluations go through `TankEngineer.runBattle` across configured seeds (serialized via evaluation queue/lock).
  - LLM judge stays qualitative only.
- Acceptance: No performance estimation without battles.

10) Persist experiment artifacts
- Files: `llm-enhanced-asi-arch.js`, `asi-arch-integration.js`, `storage/persist.js`.
- Edits:
  - Store genomes, seeds, scenario IDs, raw stats, judge scores, composite fitness.
  - `exportExperimentData()` includes seeds/scenarios and schema version.
- Acceptance: Export enables reproducibility; import restores.

### Phase 6 — Judge Calibration and Drift Monitoring
11) Benchmark set and periodic re-scoring
- Files: `llm-enhanced-asi-arch.js`, new `benchmarks/judge-bench.json`.
- Edits:
  - Fixed representative battle snapshots for judge scoring.
  - Re-score on schedule; track mean/std and drift.
- Acceptance: Calibration stats updated; regressions warn.

12) Optional ensemble prompts for stability
- Files: `deepseek-client.js`, `llm-enhanced-asi-arch.js`.
- Edits:
  - Multiple judge prompts; average normalized scores.
- Acceptance: Ensemble lowers variance (reflected in insights).

---

## File-by-File Change Guide
- `config.js`
  - `candidatePoolSize: 50`, `batchUpdateSize`, phase seeds/scenarios, secure API handling.
- `llm-enhanced-asi-arch.js`
  - Single-phase loop with evaluation queue/lock (single-sim); batch selection/pruning policy; novelty filter; diversity floor; persistence hooks; seed-based evaluation; judge calibration; no simulated scoring.
- `asi-arch-modules.js`
  - Researcher: diversity constraints and cognition retrieval; Engineer: seed-aware battles; Analyst: constraint logs and single-phase verification notes.
- `game-engine.js`
  - Deterministic seeding, scenario presets via init params.
- `enhanced-asi-arch.js`
  - Reuse/add diversity metrics and clustering utilities.
- `asi-arch-integration.js`
  - Export/import wiring; status UI for evaluation queue state and verification counts.
- `deepseek-client.js`
  - No inline key; optional ensemble judge prompts; keep caching.
- New: `cognition/tactics.json`, `storage/persist.js`, `benchmarks/judge-bench.json`.
 - Optional new (if preferred): `core/eval-queue.js` for a minimal serialized evaluation scheduler.

---

## Tests and Acceptance
Create/extend tests under `tests/`:
- `tests/pool-policy.test.js`: Pool size=50; batch updates honored; pruning consistent.
- `tests/evaluation-queue.test.js`: Only one battle at a time; queue drains in order; lock prevents overlap.
- `tests/seeded-scenarios.test.js`: Seeds+scenarios → reproducible stats.
- `tests/novelty-degeneracy.test.js`: Degenerates rejected; diversity floor maintained.
- `tests/persistence.test.js`: Export/import round-trip; resume state.
- `tests/judge-calibration.test.js`: Benchmark scored; drift metrics captured.

Global acceptance criteria:
- Composite fitness remains: quantitative (sigmoid deltas), qualitative (LLM judge), innovation (novelty/diversity) — weights from `config.js`.
- No simulated performance: verification uses real battles across seeds/scenarios, serialized by the evaluation queue.
- Single-simulation runtime respected: never more than one active battle.
- Security: No secrets committed; mock mode works without keys.

---

## Risks and Mitigations
- Runtime variance: Use multi-seed held-out scenarios; robust stats.
- LLM latency/cost: Batch requests; cache stable prompts; mock mode.
- Browser storage limits: Compact artifacts; allow manual export to file.
- Backward compatibility: Gate behavior with config flags; safe defaults.

---

## Appendix A — Minimal Persistence Schema (JSON)
- version: number
- candidates: [{ genome: number[9], team: 'red'|'blue', fitness: number, innovation: number }]
- history: [{ id, teamStats, scenarioId, seeds, duration, winner, rawStats }]
- judge: [{ candidateId, score, reasoning, confidence }]
- configSnapshot: subset of `CONFIG.asiArch`

---

## Appendix B — Quick Agent Checklist
- [ ] Update `config.js` (pool=50, batch selection size, secure API comment).
- [ ] Ensure `runExperimentCycle` uses a serialized evaluation queue/lock; in-loop verification gating with held-out seeds.
- [ ] Confirm seeded scenarios and deterministic hooks in `game-engine.js` (Phase 2 DONE).
- [ ] Implement novelty/diversity metrics and degeneracy filter.
- [ ] Externalize cognition to `cognition/tactics.json` with retrieval.
- [ ] Implement persistence (export/import + autosave) and remove simulated scoring.
- [ ] Add judge calibration with a fixed benchmark set and optional ensemble prompts.
- [ ] Add and run new tests (incl. evaluation queue); keep existing tests green.

---

## How to Use This Doc
Work through phases in order. Keep edits small and config-driven. After each phase, run tests and a short smoke battle to confirm behavior and performance.
