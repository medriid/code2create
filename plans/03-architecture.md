# Architecture

The simplest thing that is still credible. Every component below earns its place
by being either necessary for the loop or necessary for the failure story.

## System view

```
                    seeded grid / inverter event
                                 │
                       ┌─────────▼──────────┐
                       │  site coordinator  │
                       └─────────┬──────────┘
                  capacity · fairness · deadlines
                 ┌───────────────┼───────────────┐
        budget ▼ │ offer         │               │
          ┌──────┴───┐    ┌──────┴───┐    ┌──────┴───┐
          │ gateway A│    │ gateway B│ …  │ gateway E│
          └────┬─────┘    └────┬─────┘    └────┬─────┘
               │               │               │
      telemetry ─► twin ─► command ─► ack ─► observed state
               │               │               │
        emulated devices, and one optional 5 V ESP32 light

  control plane   versioned MQTT topics on the local LAN
  evidence plane  append-only SQLite event log + replay
  operator plane  one Streamlit/Plotly console
```

## Components

| Component | Why it exists | Owner | Fallback if it fails |
|---|---|---|---|
| Eclipse Mosquitto | Local pub/sub. MQTT 5 gives sessions, QoS and abnormal-disconnect Wills | M3 | Broker and all core services on the primary laptop |
| Python device nodes | Deterministic device state; makes five laptops behave like five households | M2 | One laptop runs every node with distinct gateway IDs |
| Gateway agent | Owns local device detail, forms offers, applies the household budget | M3 + M1 | Fixed local priority policy on the last valid budget |
| Coordinator | Twins, validation, planner invocation, plan publication | M1 | Last good plan, deterministic greedy |
| OR-Tools CP-SAT | Discrete scheduling under heterogeneous constraints | M1 | **Time-boxed greedy with an identical output schema** |
| Pydantic schemas | Rejects malformed and stale messages with explainable errors | M1/M2 | Hand-validated minimum field set |
| SQLite event log | Telemetry, decisions, commands and acknowledgements, for replay | M3 | Newline-delimited JSON file |
| FastAPI read API | Separates system state from UI; exposes health and replay | M1 | Console imports a read-only state adapter directly |
| Streamlit + Plotly | Fastest route to a polished operator console in Python | M4 | Static seeded state + live event counter. **Never rebuild in React mid-event** |
| ESP32 node | Makes one command physically visible; proves protocol parity | M5 | Python node with an on-screen LED, exact same payload |
| Event adapter | Turns a slider or seeded grid event into site capacity | M5 | Fixed scenario JSON |

On Wokwi: it can simulate ESP32 Wi-Fi and MQTT, but its public gateway cannot
reach our local LAN. It is a rehearsal aid, never part of the demo path.

## MQTT, Matter and OpenADR have different jobs

Getting this distinction right in 45 seconds of questioning is worth more than
any feature.

**MQTT is the local event fabric.** A lightweight publish/subscribe protocol for
machine-to-machine and IoT contexts. Mosquitto implements MQTT 5 and 3.x. This is
what we actually build on.

**Matter is a device interoperability direction, not our decision engine.**
Matter 1.5 added standardised energy pricing, tariff and carbon-intensity
information that devices can use to adjust operation. A future gateway adapter
could translate Matter device capabilities into FILAMENT's internal model. We do
not attempt certification and we do not claim an implemented Matter controller.

**OpenADR is the upstream signal direction.** It standardises demand-response
price, reliability and capacity events between utilities, aggregators and control
systems; OpenADR 3 targets homes, appliances, EVs and distributed resources. The
MVP uses **at most one** transparent OpenADR-shaped JSON fixture.

Said plainly: MQTT is built, Matter is a named future adapter, OpenADR is one
illustrative fixture. Anyone who claims more in the pitch is creating a question
we cannot answer.

## Topic contract

```
filament/v1/site/{site_id}/gateway/{gateway_id}/status
filament/v1/site/{site_id}/gateway/{gateway_id}/offer
filament/v1/site/{site_id}/device/{device_id}/telemetry
filament/v1/site/{site_id}/device/{device_id}/command
filament/v1/site/{site_id}/device/{device_id}/ack
filament/v1/site/{site_id}/event/capacity
```

Telemetry:

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

Command:

```json
{
  "schema": "filament.command.v1",
  "plan_id": "plan-0042",
  "version": 42,
  "device_id": "washer-1",
  "target_state": "paused",
  "expires_at": "2026-09-07T07:47:00+05:30",
  "reason": "cap_reduction"
}
```

Gateway status is **retained**, so a coordinator restart immediately sees who
exists. Device commands are not retained — a retained command is a command that
fires again at the worst possible moment.

## Planner model

For device *i* and five-minute slot *t*, a binary run variable `x[i,t]`, or one
of a small number of allowed power levels.

```
maximize   delivered utility
         − missed-deadline penalty
         − switching penalty
         − household curtailment-debt penalty
```

Subject to:

- Σ scheduled watts in each slot ≤ site capacity for that slot
- Protected devices stay on only while the hard system remains feasible
- Deadline jobs receive their required slots before their deadline
- Minimum run/off rules prevent oscillation
- No gateway receives more than its published envelope permits
- Stale or unacknowledged loads reserve conservative power until resolved

The optimiser has a **hard wall-clock limit**. On timeout, the fallback sorts
protected → firm → flexible, then picks flexible jobs by deadline and accumulated
curtailment debt.

The fallback is not "less real". It is the safety mechanism, and it is the thing
that guarantees criterion 2 in [02-mvp.md](02-mvp.md).

## Data flow

1. Device telemetry is schema-validated and appended to the event log
2. The twin updates observed state and heartbeat age
3. A cap event, device change, missing acknowledgement or timer marks the plan dirty
4. A snapshot enters the planner; **planner output is independently re-validated
   for cap compliance** before anything is published
5. Versioned commands publish; the UI shows them as pending immediately
6. Acknowledgements and later telemetry move pending → verified / rejected / stale
7. Unexpected state triggers a replan and a human-readable reason code

Step 4 is deliberately paranoid. The planner is the component most likely to be
subtly wrong at hour 30, and it is the one component whose mistakes look like
success.

## Security and privacy boundary

The judged LAN build uses explicit demo credentials and no public exposure.

Production would require per-device identity, TLS, broker ACLs, key rotation,
signed firmware, audit retention and safety-certified actuation. **The prototype
must not pretend otherwise**, and saying so is a strength in questioning, not a
weakness.

In **privacy mode**, a gateway keeps device-level preferences local and publishes
only an aggregate envelope: minimum safe watts, preferred watts, maximum useful
watts, deadline energy, curtailment debt. The MVP may still expose device detail
inside the demo LAN for explainability — that difference gets a visible label on
screen.

## Deployment

One team-controlled router, or the primary laptop's hotspot.

- **Primary laptop:** broker, coordinator, API, database, dashboard
- **Four others:** one gateway plus four to six devices each
- All services bind to the private LAN. No cloud deployment for judging
- **Single-laptop mode** runs every process with distinct IDs — this is the
  fallback for a dead teammate laptop and it gets tested, not assumed
