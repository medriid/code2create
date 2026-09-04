# Reviews, demo and failure proofing

## The idea submission

It must communicate: one affected operating moment, the distributed mechanism,
the exact 48-hour proof, the failure demo, and honest scale. Include "no mains
switching" so reviewers understand the safety boundary before they wonder about it.

> **FILAMENT OS** is an offline-first coordination layer for homes, hostel rooms
> and small microgrids that share constrained power. Local gateways publish only
> flexible power needs, priorities and deadlines. When capacity drops, a
> constraint planner assigns fair budgets, commands real or emulated devices over
> MQTT, verifies acknowledgements and replans when nodes fail. In 48 hours, five
> laptops will represent five homes with 20–30 devices, while an optional ESP32
> low-voltage light proves the physical loop. The demo will measure cap
> compliance, response time, deadline completion and recovery after a gateway
> disconnects.

Submit a narrow proof with credible scale, not a feature catalogue.

## Review 1 — Progress Check (non-eliminatory)

**Must work:** broker, at least five devices, twin, one cap event, greedy plan,
two acknowledged commands, a live state panel.

**Show:** 15-second problem → judge triggers a cap change → one device goes from
running to paused → a pending acknowledgement becomes verified → then the
architecture and the hour-by-hour remaining plan.

**Do not show:** future Matter/OpenADR diagrams before the live loop, incomplete
hardware, or an optimiser notebook disconnected from real devices.

**Backup:** single-laptop scenario plus a 30-second recording of the distributed run.

**If asked why the planner is simple:** *"We intentionally built the end-to-end
loop before the optimal planner. The planner is a pure module; the deterministic
fallback already enforces capacity."* That is a design answer, not an excuse, and
it should sound like one.

## Review 2 — Prototype Evaluation (eliminatory)

This is the survival target.

**Must work:** 20+ devices, five logical gateways, cap/deadline/fairness planning,
commands, acknowledgements, stale detection, replan, event log, one-screen UI.
The physical light is bonus only.

**Show, in this order:**

1. Current overload
2. Cap drop
3. Automatic allocation
4. Verified below-cap state
5. Protect a device → revised plan
6. Kill gateway C → stale status → replan
7. Metrics

**Do not show:** terminal setup, scrolling source code, a login screen, cloud
deployment, unsupported savings claims, or a "future features" tour.

**Backup:** one-click deterministic replay that animates the exact event log; a
short video; screenshots of key states; all devices on one laptop.

**Be ready to draw** the topic and version flow, the planner constraints, and the
gateway privacy boundary — on a whiteboard, in 45 seconds.

## Final pitch

Same frozen Review 2 path. **The final is not the time to demonstrate a newly
added feature.**

Show the judge control, the physical response if it is reliable, a node failure,
and the metric delta. End with the exact product boundary and the next real
validation step.

Do not show fifteen screens, a market-size slide, hypothetical AI, or
utility-grade language.

---

## The three-minute demo

| Time | Beat |
|---|---|
| **0:00–0:20** | **Problem.** *"When a hostel inverter, apartment feeder or local microgrid loses capacity, every home makes decisions alone. The result is overload, blunt shutdowns, or one household absorbing all the inconvenience."* Show five homes drawing 4.6 kW against a normal 5 kW cap |
| **0:20–0:40** | **Existing failure.** Click *Uncoordinated mode*, drop the cap to 1.8 kW. The feeder turns red; an overload timer advances. *"Monitoring tells us we are failing. It does not decide, act, or prove recovery."* |
| **0:40–1:00** | **Insight.** *"Each home keeps its private device choices local and publishes a flexibility offer: minimum, preferred, deadline energy, fairness debt. A coordinator allocates the scarce power; gateways enforce it."* Switch to FILAMENT OS |
| **1:00–2:20** | **Live demo.** See below |
| **2:20–2:45** | **Technical innovation.** *"Every command is versioned and expiring. Every device reports observed state. The scheduler handles capacity, deadlines, minimum runtimes, switching cost and cross-household curtailment debt. If optimisation times out, the deterministic policy takes over. The whole judged path runs on the LAN."* |
| **2:45–3:00** | **Impact and boundary.** *"This is not a certified electrical controller. It is the interoperable coordination layer between grid events and local gateways. Next we would integrate one real Home Assistant or Matter household, and validate policies with a hostel or apartment operator."* |

### The live section, in order

1. Drag the cap from 5 kW to 1.8 kW.
2. A plan appears in under one second. Water heaters, washer and EV emulators
   defer; router, fridge and the protected device stay up.
3. Pending command dots become verified ticks. The physical 5 V light changes if
   hardware is green. Observed load falls below the cap.
4. **Ask the judge to click "Protect this washer."** The plan changes elsewhere
   rather than violating the cap.
5. **Disconnect gateway C.** Its card turns amber, then red. Unknown load is
   reserved conservatively. Another household's flexible slot moves. The recovery
   timer stops.

**The wow moment** is not a redrawn graph. It is that the product changes device
state, proves acknowledgement, survives a disappearing household, and stays under
a hard physical constraint — while a stranger drives it.

---

## Failure proofing

| Failure | Detection | Live fallback | Stored fallback |
|---|---|---|---|
| Internet unavailable | External reachability check fails | **Nothing changes.** Broker, planner, UI and devices are all on the LAN | Local source wheel/cache and offline run instructions |
| ESP32 unavailable | Node absent at the pre-demo check | On-screen LED device using the same MQTT payload | Video of an earlier physical run, **labelled as recorded** |
| ESP32 disconnects mid-demo | Heartbeat age and MQTT Will | **Use it as the planned failure demonstration.** Replan | Replay trace |
| One team laptop dies | Gateway health absent | Launch that gateway's IDs on the primary laptop | Single-laptop profile |

The ESP32 row is the important one. A hardware failure during a live demo is
either a disaster or the exact thing you were about to demonstrate on purpose —
and which one it is depends entirely on whether you rehearsed it.
