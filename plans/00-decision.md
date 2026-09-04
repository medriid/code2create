# The decision

**Build FILAMENT OS** — a distributed operating layer for flexible electricity
demand.

## The thirty-second story

A group of homes, hostel rooms or small buildings shares one constrained feeder,
inverter or microgrid. Each local gateway knows which of its loads are critical,
which can wait, and which have deadlines. Gateways expose only a flexibility
offer. A site coordinator assigns each of them a temporary power budget. The
gateways send versioned commands to devices and verify what actually happened.
If a device ignores a command or a gateway disappears, the system detects the
missing acknowledgement and replans.

The mission is large. The judged slice is deliberately small.

## Why this one

It survived a twenty-five idea kill room against existing products, and won on a
weighted model of survival, relevance, novelty, technical credibility, wow
factor, 48-hour feasibility, UX and scalability. Those weights are the team's
strategic model, not Code2Create's official rubric — no verified numerical
weights exist.

| Rank | Idea | Score |
|---:|---|---:|
| **1** | **FILAMENT OS** | **8.55** |
| 2 | ColdChain Swarm | 8.00 |
| 3 | EVShare Grid | 7.95 |
| 4 | EdgeOTA Guard | 7.80 |
| 5 | Assistive Room OS | 7.80 |

What actually separates it from the runners-up:

- **It is a distributed system.** Five independently failing gateways,
  asynchronous messages, stale state, command acknowledgement, recovery. Not a
  dashboard over a database.
- **It is an optimization system.** Hard capacity constraints, device deadlines,
  switching penalties, cross-household fairness, and an explicit infeasible path.
- **It is a cyber-physical loop.** Sense → decide → command → acknowledge →
  measure → replan. It cannot be reduced to CRUD screens, which is exactly the
  failure mode the participant portal's own example ideas warn against.
- **It has a real standards path.** MQTT inside the site, OpenADR-shaped events
  above it, Matter or Home Assistant adapters at the edge. All of it honest about
  what is implemented versus illustrative.
- **It has a judge-controlled consequence.** Drag the available-power limit down
  and watch real and virtual loads adapt without ever exceeding the cap. A
  non-specialist can operate the wow moment themselves.

## The ruthless boundary

Do not claim to have built a utility-grade demand-response platform, a certified
smart panel, a real microgrid controller, or guaranteed savings.

**The prototype never switches mains voltage.** It proves five things:
interoperable device messaging, a maintained device twin, constraint-aware
allocation, closed-loop command verification, and graceful recovery. That is
already a serious 48-hour system, and saying so plainly is more convincing than
overclaiming.

The greatest danger to this project is scope. The MVP stays at five features.
See [02-mvp.md](02-mvp.md), especially the "do not build" list, which is longer
than the "must build" list on purpose.

## Backups

**#2 — ColdChain Swarm.** Only if organisers react badly to energy demand
response, or if the team cannot explain cross-household fairness. It shares the
MQTT layer, twins, commands, acknowledgements, failure injection and UI
structure. Its extra burden is a transparent accelerated thermal model and
careful safety claims.

**#3 — BlackStart Hostel.** This is not a second codebase. It is FILAMENT OS with
one site, fixed priority tiers, no CP-SAT time horizon, and round-robin fairness
debt. If the optimiser is still unstable at hour 18, switch the *story* to hostel
inverter resilience and keep the complete control loop.

A smaller working system beats a grand broken one. That trade is pre-approved so
nobody has to argue for it at 3am.

## Before anything else

1. **Confirm the event date today.** graVITas says 6–8 September, 13:00 to 13:00.
   ACM-VIT's newer promotional post says 7–9. Do not infer which is
   operationally correct — ask.
2. **Confirm the idea-submission state.** The internal deadline was quoted as
   4 September 23:59 and the external one as 3 September 21:00; Unstop shows
   registration closed 2 September. If registered, submit through the portal now.
3. **Ask organisers what "from scratch" permits.** Until answered, prepare
   concepts and disposable exercises only. See [07-rules.md](07-rules.md).
4. **Borrow, do not depend on, one ESP32.** The full judged path must work with
   software device nodes alone.
