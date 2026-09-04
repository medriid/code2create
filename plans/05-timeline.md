# Timeline

## Three days of preparation

The official rules conflict with wanting a reusable skeleton before the event.
**The rules win.** Preparation produces understanding, paper specifications and
disposable exercises — not competition code. The official repository is created
only after the organisers start the clock. See [07-rules.md](07-rules.md).

### Day 1 — understand the loop, freeze the product

*Team block, 90 minutes.* Rehearse the one-line problem, the existing-product
objection, the five-feature MVP, and the "no mains" safety boundary. Draw the
architecture and freeze the topic and payload fields — on paper or in a planning
document.

| Who | 3 hours |
|---|---|
| M1 | Solve one tiny **disposable** scheduling exercise: six loads, one capacity constraint. Learn how to time-box CP-SAT and validate its output |
| M2 | Write a disposable 20-line publisher/subscriber sending one JSON heartbeat. Explain duplicate command handling out loud |
| M3 | Install and operate Mosquitto locally. Practise retained status, Last Will, and topic monitoring |
| M4 | Build a disposable Streamlit dashboard from static JSON — one chart, one device table |
| M5 | Inventory hardware. If an ESP32 exists, blink an onboard/external low-voltage LED and get it on Wi-Fi. **No final firmware** |

**Must finish:** shared vocabulary, frozen event story, hardware inventory, one
isolated learning exercise each.
**Ignore:** logos, Figma detail, cloud deployment, forecasts.

### Day 2 — rehearse contracts and failures

*Team block, 60 minutes.* Walk one scenario manually, out loud:
normal 5 kW → cap drops to 1.8 kW → protect the washer → gateway C disappears →
critical demand alone exceeds the cap. **Everyone predicts the system's behaviour
before anyone writes it down.** Disagreements found here are free.

| Who | Task |
|---|---|
| M1 | Specify planner input/output and ten acceptance examples on paper. Practise explaining fairness and infeasibility |
| M2 | Practise a config-driven state machine with generic devices — then delete it. Do not copy it into competition work |
| M3 | Practise broker restart and LAN addressing across two laptops. Write an operational checklist, not reusable code |
| M4 | Sketch the final one-screen layout at 1366×768 and choose visual labels |
| M5 | Draft the test matrix and the three-minute storyboard. Verify screen recording works offline |

**Must finish:** message examples, state-transition table, UI wireframe, test
matrix, pitch outline.
**Ignore:** live external data, phone UI, custom PCB, casing.

### Day 3 — dry-run the process

Run a **two-hour no-copy simulation in a throwaway repository**: create tasks,
branch, review, merge, launch, and diagnose a deliberately broken message. Then
delete or archive it outside the competition path. The goal is process memory,
not reusable implementation.

| Who | Task |
|---|---|
| M1 | Prepare AI coding prompts that demand small functions, tests and docstrings, and forbid framework changes. **Do not pre-generate final code** |
| M2/M3 | Prepare device and gateway configuration values in a human-readable planning sheet. Confirm with organisers whether fixtures count as pre-built material before importing any |
| M4 | Prepare colour and typography choices and a screen-layout checklist — not source files |
| M5 | Pack: router/hotspot, chargers, extension board, labels, HDMI adapter, and ESP32/LED/resistor/USB cables if available |

**Must finish:** logistics, role cards, branch/merge routine, feature kill points,
organiser questions.
**Ignore:** adding features because preparation felt easy. It always does.

---

## The forty-eight hours

| Window | Objective | Deliverable and test | Do not touch |
|---|---|---|---|
| **0–2h** | All: confirm rules and rubric, create the clean repo and issue board. M1/M2 freeze schemas. M3 launches the broker. M4 creates the UI shell. M5 creates scenario/test folders | Two Python processes exchange a validated heartbeat and command. README states the safety and claim boundary | CP-SAT, hardware, styling, cloud |
| **2–6h** | M2 builds five devices. M3 logs messages. M1 builds the twin plus a deterministic priority scheduler. M4 uses mock state. M5 writes the scenario launcher | Judge changes a CLI cap; at least two devices change and acknowledge; the cap check passes. **Record the first vertical slice** | Matter, OpenADR, database abstractions, React |
| **6–12h** | M2 expands to 20–30 nodes and failure modes. M3 adds five gateways and offers. M1 connects command versions and replan. M4 connects live state | Full five-laptop (or single-laptop) fleet. A killed device goes stale. Dashboard shows pending, then verified | Forecasts, authentication, sensor calibration |
| **12–18h** | M1 adds the deadline/fairness planner behind the interface. M2 writes idempotency tests. M3 adds replay. M4 builds the timeline and reason panel. **M5 starts the physical node only if the software loop is green** | Greedy and CP-SAT both produce schema-valid plans. Automated cap/deadline/failure tests pass | New device types, redesign, cloud |
| **18–24h** | Integration and Review 1 hardening. M5 runs three scripted scenarios. M1 documents the algorithm. M4 improves the one-screen hierarchy | Review 1 demo: real messages, the first complete loop, an exact roadmap, role evidence. **Tag a runnable checkpoint** | Anything a reviewer calls "nice to have" unless it fixes the core |
| **24–30h** | Fault injection: gateway loss, delayed ack, stale telemetry, infeasible cap, broker restart. **Hardware gets its final go/kill decision** | The system never silently reports false compliance. Every fault has a visible state and a stored event | Physical debugging after the kill point, multi-broker replication |
| **30–36h** | UX and evidence. M4 freezes controls and layout. M3 exports replay. M2 tunes the scenario. M1 profiles planning latency | The Review 2 build runs from a clean start script. Metrics and reason codes are legible. **Three consecutive passes** | Feature additions, library upgrades |
| **36–42h** | **Feature freeze.** M5 records the backup video and screenshots. All rehearse questions and subsystem explanations | Versioned release, offline install/run instructions, evidence folder, three-minute demo under 2:50 | Code generation without review, refactors, aesthetic experiments |
| **42–48h** | Only bug fixes with a rollback plan. **Rest in rotation.** Final pitch and handoff | Final build hash, local backup, alternate-laptop copy, contribution summary, live *and* recorded demo options | Schema changes, optimiser redesign, hardware rewiring |

### The three rules of the clock

1. **The vertical slice comes before the good algorithm.** A working end-to-end
   loop with a dumb scheduler beats a brilliant scheduler with nothing to command.
2. **Every "do not touch" column is load-bearing.** They are written in advance
   precisely because at hour 30 they will feel like unnecessary caution.
3. **Rest in rotation is a deliverable.** A team that has not slept fails Review 2
   in ways that look like bad engineering.
