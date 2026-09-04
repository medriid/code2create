# The MVP

Five features. Not six.

## 1. Device and gateway contract

Twenty to thirty device nodes across five laptops. Each publishes identity,
gateway, present watts, operating state, flexibility class, priority, deadline
if it has one, minimum run time, heartbeat and a message timestamp.

At least one node may be a real ESP32 driving a low-voltage LED. **The physical
and emulated nodes use the same topic and payload contract** — that identity is
the reason the hardware is worth having at all. If the ESP32 needs a special
case, it has stopped proving anything.

## 2. Live digital twin and health

The coordinator maintains, per device: desired state, observed state, last
heartbeat, stale/offline status, command version, last acknowledgement.

A node that stops sending telemetry is **not** silently treated as zero load. It
becomes `unknown`, reserves a conservative budget, and raises a visible incident.
This is the single most important correctness decision in the system: assuming a
silent load is off is how a real controller overloads a real feeder.

## 3. Capacity, deadline and fairness planner

A judge changes the available site power, or triggers a seeded inverter event.
The planner selects which flexible devices run during the next **twelve
five-minute slots**.

Hard constraints: total scheduled power under the cap; minimum runs respected;
protected loads stay up; deadline jobs finish where feasible.

Objective: penalise switching, missed deadlines, and unequal curtailment across
gateways.

## 4. Closed-loop control and replan

Every command carries `plan_id`, a monotonically increasing `version`, a target
state, an expiry and a reason. Devices answer `applied`, `rejected`, `duplicate`
or `expired`. The coordinator compares desired against observed power. A missing
acknowledgement or unexpected wattage triggers a deterministic replan.

## 5. One-screen operations console

Site cap versus observed load. Five gateway budgets. Device state. Plan timeline.
Fairness indicator. Reason codes. Unacknowledged and offline nodes.

The judge gets **three controls**: change the cap, protect one device,
disconnect/inject a failure. Nothing else is clickable.

---

## MUST BUILD

- A versioned MQTT schema with validation, and retained discovery/status rules
- At least 20 emulated devices across five gateway processes, launched by one
  seeded command
- A **deterministic priority/fairness scheduler first**, then CP-SAT behind the
  same interface
- Commands, acknowledgements, heartbeats, stale detection, replanning
- A live dashboard plus an append-only decision/event log
- Automated tests for cap compliance, idempotent commands, missed
  acknowledgements, and infeasible critical load

## NICE TO HAVE

- One ESP32 with an onboard or external LED. INA219 **only** if already understood
- A simple OpenADR-shaped event adapter translating a capacity event into the
  internal cap — clearly labelled as illustrative, never as certified
- A downloadable incident/replay bundle
- Optimiser comparison: greedy versus CP-SAT on the same scenario
- A gateway publishing only an aggregate flexibility envelope in privacy mode

## DO NOT BUILD

Read this list again at hour 20 and hour 32, when it will feel unreasonable.

- Mains switching, breaker integration, an inverter, battery hardware, an EV charger
- A real Matter controller, production OpenADR, utility integration, a Home
  Assistant plugin
- Forecasting ML, LLM recommendations, billing, payments, carbon credits, blockchain
- Accounts, mobile apps, maps, notifications, multi-tenant cloud, a general rule builder
- City-scale simulation, peer-to-peer consensus, distributed optimisation research

Every item on that list has killed a hackathon project that was otherwise going
to place.

## Acceptance criteria

1. All seeded devices appear within **10 seconds** of scenario start.
2. A cap change creates a plan within **1 second** on the demo laptop. If CP-SAT
   exceeds its limit, the greedy fallback returns immediately.
3. Observed controlled load falls under the cap within **5 seconds** when a
   feasible plan exists.
4. Every command is idempotent. Replaying a command cannot toggle a device twice.
5. A killed gateway becomes stale within the configured timeout, appears red, and
   causes a conservative replan.
6. The system **explicitly declares infeasible** if protected and critical demand
   alone exceeds the cap. It never fabricates compliance.
7. The same seed produces the same fallback plan and a downloadable event trace.

## Measurable outputs

| Metric | Definition |
|---|---|
| Cap compliance | % of samples at or below the limit after the response grace period |
| Response time | Cap-event timestamp → verified below-cap timestamp |
| Acknowledgement success | Applied acknowledgements ÷ issued commands |
| Deadline satisfaction | Flexible jobs completed by their requested deadline |
| Recovery time | Failed-node detection → replacement plan |
| Fairness | Jain's index over delivered ÷ requested flexible energy |

Fairness is shown **only where every denominator is valid**. A value near 1 means
allocations were similar. It does not prove social fairness, and we do not say
that it does.
