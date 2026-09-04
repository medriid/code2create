<p align="center">
  <img src="assets/brand/logo-stacked.svg" alt="FILAMENT OS" width="260">
</p>

<p align="center">
  <em>Offline coordination for homes, hostels and small microgrids.<br>
  Five gateways. Thirty devices. One hard power limit.</em>
</p>

<p align="center">
  <sub>Renamed to <strong>FILAMENT OS</strong> — this project was called
  <strong>POWERWEAVE OS</strong> in the original research brief.<br>
  Topics and schemas moved with it: <code>powerweave/v1/…</code> → <code>filament/v1/…</code>.</sub>
</p>

---

> **This is the preparation repository, not the competition repository.**
> Code2Create rules require the project to be built during the event, from
> scratch, with no prior commits or reused code. So this repo holds the decision,
> the plans, the frozen interfaces, the brand and the site — and the architecture
> as *empty directories*. No implementation lands here. The real repo gets
> created after the organisers start the clock. See
> [plans/07-rules.md](plans/07-rules.md).

## The problem

A hostel inverter drops to a fraction of its normal capacity. An apartment feeder
browns out. A small microgrid loses its main source. In every one of those
moments, each home decides alone — and the result is an overload, a blunt
whole-block shutdown, or one unlucky household absorbing all of the
inconvenience.

Monitoring tells you that you're failing. It does not decide, act, or prove
recovery.

## What FILAMENT OS does

Each home runs a gateway that knows which of its loads are critical, which can
wait, and which have deadlines. The gateway keeps those details private and
publishes only a **flexibility offer**: minimum safe watts, preferred watts,
maximum useful watts, deadline energy, and how much curtailment it has already
absorbed.

A site coordinator takes the available power and hands each gateway a temporary
budget. Gateways issue versioned commands to their devices. Devices acknowledge.
The coordinator compares what it asked for against what actually happened — and
when a device ignores a command or an entire gateway disappears, the missing
acknowledgement is detected and the plan is redone.

```
                 grid / inverter capacity event
                              │
                    ┌─────────▼─────────┐
                    │  site coordinator │   capacity · fairness · deadlines
                    └─────────┬─────────┘
              budget ┌────────┼────────┐ offer
                     ▼        ▼        ▼
              ┌──────────┐ ┌──────┐ ┌──────────┐
              │ gateway A│ │  B   │ │ …up to E │   private device detail
              └────┬─────┘ └──┬───┘ └────┬─────┘
                   │          │          │
        telemetry ─► twin ─► command ─► ack ─► observed ─► replan
                   │          │          │
              20–30 emulated devices + one optional ESP32 low-voltage light
```

Three planes, kept separate on purpose:

- **Control plane** — versioned MQTT topics on the local LAN
- **Evidence plane** — an append-only SQLite event log you can replay
- **Operator plane** — one screen, three controls

## The boundary

This matters more than the feature list, and it goes on the first slide:

**FILAMENT OS never switches mains voltage.** It is not a smart panel, not an
inverter controller, not a certified demand-response platform, and it makes no
savings claims. It is a planning-and-control demonstrator: 20–30 emulated devices
across five laptops, plus — if the hardware cooperates — one ESP32 driving a
low-voltage LED on exactly the same message contract as every software node.

The prototype proves five things and claims nothing else: interoperable device
messaging, a maintained device twin, constraint-aware allocation, closed-loop
command verification, and graceful recovery.

## The five features

1. **Device and gateway contract** — every node publishes identity, gateway,
   observed watts, state, flexibility class, priority, deadline, minimum run
   time, heartbeat and timestamp. The ESP32 uses the same payload as the
   emulators, which is the whole point of it being there.
2. **Live twin and health** — desired state, observed state, heartbeat age,
   command version, last acknowledgement. A silent node is never treated as zero
   load. It becomes *unknown*, reserves a conservative budget, and raises a
   visible incident.
3. **Capacity, deadline and fairness planner** — twelve five-minute slots. Hard
   constraints on the cap, minimum runs and protected loads. The objective
   penalises switching, missed deadlines and unequal curtailment between homes.
4. **Closed-loop control** — every command carries a `plan_id`, a monotonic
   version, a target state, an expiry and a reason. Devices answer
   applied / rejected / duplicate / expired. Divergence triggers a replan.
5. **One-screen console** — cap versus observed load, five gateway cards, device
   table, plan timeline, fairness indicator, reason codes, pending
   acknowledgements. The judge gets three controls: **change the cap**,
   **protect a device**, **kill a gateway**.

## Stack

| Layer | Choice | Why, and what happens if it fails |
|---|---|---|
| Broker | Eclipse Mosquitto (MQTT 5) | Sessions, QoS, Will messages. Fallback: everything on the primary laptop |
| Devices | Python + paho-mqtt | Config-driven emulators. Fallback: all nodes on one laptop, distinct IDs |
| Gateway | Python agent | Owns local detail, forms offers. Fallback: fixed local policy on last valid budget |
| Coordinator | Python asyncio | Twins, validation, plan publication. Fallback: last good plan |
| Planner | OR-Tools CP-SAT | Time-boxed. **Fallback: deterministic greedy with an identical output schema** |
| Schemas | Pydantic | Rejects malformed and stale messages with explainable errors |
| Evidence | SQLite, append-only | Replay. Fallback: newline-delimited JSON |
| API | FastAPI | Separates state from UI. Fallback: the console imports a read-only adapter |
| Console | Streamlit + Plotly | Fast and legible at projector resolution. **Do not rebuild in React mid-event** |
| Physical node | ESP32 + low-voltage LED | Proves protocol parity. Fallback: an on-screen LED, same payload |

The greedy fallback is not the lesser path. It is the safety mechanism, and it
enforces the cap on its own — which is why it gets built first and CP-SAT slots
in behind the same interface.

## Topics

```
filament/v1/site/{site}/gateway/{gw}/status      retained
filament/v1/site/{site}/gateway/{gw}/offer
filament/v1/site/{site}/device/{dev}/telemetry
filament/v1/site/{site}/device/{dev}/command
filament/v1/site/{site}/device/{dev}/ack
filament/v1/site/{site}/event/capacity
```

```json
{
  "schema": "filament.telemetry.v1",
  "message_id": "01J...",
  "gateway_id": "home-c",
  "device_id": "washer-1",
  "observed_w": 520,
  "state": "running",
  "flex_class": "deadline",
  "priority": 55,
  "deadline": "2026-09-07T09:00:00+05:30",
  "min_run_s": 300,
  "ts": "2026-09-07T07:42:10+05:30"
}
```

Full contract in [plans/03-architecture.md](plans/03-architecture.md).

## Acceptance criteria

The prototype is done when all seven hold, on the demo laptop, three times in a row:

1. Every seeded device appears within **10 seconds** of scenario start.
2. A cap change produces a plan within **1 second**; if CP-SAT overruns, greedy
   answers immediately.
3. Observed controlled load is under the cap within **5 seconds** whenever a
   feasible plan exists.
4. Commands are idempotent — replaying one cannot toggle a device twice.
5. A killed gateway goes stale within its timeout, turns red, and forces a
   conservative replan.
6. If protected demand alone exceeds the cap, the system **declares infeasible**.
   It never fabricates compliance.
7. The same seed produces the same fallback plan and a downloadable trace.

Measured and shown on screen: cap compliance, response time, acknowledgement
success rate, deadline satisfaction, recovery time, and Jain's index over
delivered-versus-requested flexible energy — displayed only where every
denominator is valid, and described as allocation similarity, not social fairness.

## Layout

```
plans/          the decision, the MVP, the architecture, the 48 hours
docs/           architecture notes, ADRs, protocol, runbooks
services/       coordinator · gateway · device-node · planner · api · console · eventlog
packages/       schemas · contracts
firmware/       esp32-node
infra/          mosquitto · scenarios · scripts
tests/          unit · acceptance · fault-injection
evidence/       replays · screenshots · video
assets/brand/   the logo, and the script that generates it
web/submission/ the project site
```

Every one of those service directories is empty, and stays empty until the clock
starts. They are the frozen shape of the system, which is the thing preparation
is actually allowed to produce.

## The site

`web/submission/` is the project site — one long vertical scroll whose hero
performs the demand-response demo as you scroll it.

```bash
npm run build     # writes web/submission/dist/index.html
npm start         # build, then serve on http://localhost:5173
npm run dev       # serve and rebuild on change
```

**No dependencies.** No `npm install`, no bundler, no network. `dist/index.html`
is self-contained and opens straight off a USB stick — the same reason the
product itself runs on a LAN.

### Deploying

`vercel.json` carries the settings. The one thing Vercel needs from you is the
**Root Directory**, set to `web/submission` — which is what Vercel's importer
suggests anyway, since that is where the site's `package.json` lives.

| Setting | Value |
|---|---|
| Root Directory | `web/submission` |
| Framework | Other |
| Install | `echo "no dependencies"` |
| Build | `npm run build` |
| Output | `dist` |

Every path in `vercel.json` is resolved **relative to the Root Directory**, not
the repository root — which is the one thing that is easy to get wrong here, and
did go wrong the first time.

Any other static host works the same way: build, then serve
`web/submission/dist`.

## Plans

| | |
|---|---|
| [00-decision.md](plans/00-decision.md) | What we're building and why this one |
| [01-event.md](plans/01-event.md) | Verified Code2Create position, and the unresolved conflicts |
| [02-mvp.md](plans/02-mvp.md) | Five features. Must / nice / **do not build** |
| [03-architecture.md](plans/03-architecture.md) | Components, topic contract, planner model, data flow |
| [04-team.md](plans/04-team.md) | Five people, five subsystems, dependency discipline |
| [05-timeline.md](plans/05-timeline.md) | Three days of prep, then the 48 hours hour by hour |
| [06-demo.md](plans/06-demo.md) | Review 1, Review 2, the three-minute demo, failure proofing |
| [07-rules.md](plans/07-rules.md) | The from-scratch rule and what preparation may legally produce |

Built for [Code2Create 7.0](https://code2create.acmvit.in/), ACM-VIT · graVITas '26 ·
Anna Auditorium, VIT Vellore.
