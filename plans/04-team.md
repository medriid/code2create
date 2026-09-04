# Five people, five subsystems

Everyone owns something demonstrable, testable, and explainable in twenty
seconds. Everyone has commit history. Nobody is "helping."

## M1 — advanced builder

**Owns:** schemas, coordinator state machine, planner interface, greedy fallback,
CP-SAT model, integration, final technical defence.

**Uses:** Python asyncio/threading basics, paho-mqtt, Pydantic, OR-Tools,
FastAPI, git integration.

**Ignores:** ESP32 wiring, visual styling, slide design.

**Testable output:** `plan(snapshot)` passes constraint tests; the coordinator
completes the command → ack → replan loop; the README architecture is accurate.

**Deadlines:** greedy vertical slice by **hour 6**; CP-SAT by **hour 18**;
feature freeze **hour 36**.

> Review teammates' modules rather than rewriting them. A rewritten module has
> one owner who can explain it and one who has stopped trying.

## M2 — device fleet

**Owns:** the config-driven device emulator, 20–30 seeded device profiles,
heartbeat, telemetry, versioned command handling, duplicate/expired command
tests, failure flags.

**Uses:** basic Python, JSON, paho-mqtt, simple state machines, pytest.

**Ignores:** optimisation maths, frontend.

**Testable output:** one command launches five logical homes; every node responds
idempotently; failure modes are selectable.

**Deadlines:** five nodes by **hour 4**; full fleet and tests by **hour 10**.

## M3 — gateway and evidence

**Owns:** the local broker, gateway aggregation and fallback policy, event
logging and replay, topic and LAN monitoring.

**Uses:** Mosquitto, MQTT topics/QoS/Will, SQLite or JSONL, basic Python.

**Ignores:** UI styling, CP-SAT.

**Testable output:** a broker restart checklist; five gateway statuses; replay
reproduces a run; a gateway keeps following its last budget when the coordinator
stops.

**Deadlines:** broker and logger **hour 3**; offers **hour 10**; replay **hour 24**.

## M4 — operations console

**Owns:** the one-screen Streamlit interface — cap/load chart, gateway cards,
device table, timeline, pending acknowledgements, reason panel, and the three
judge controls.

**Uses:** Streamlit state/refresh, Plotly, local API calls, light CSS.

**Ignores:** broker internals, optimisation.

**Testable output:** a judge can trigger cap / protect / failure without touching
a terminal; red, amber and green states stay legible at projector resolution.

**Deadlines:** mock console **hour 6**; live console **hour 14**; polish frozen
**hour 34**.

> Layout stays stable at 1366×768. The projector is not your monitor.

## M5 — physical proof, QA and story

**Owns:** the optional ESP32 low-voltage LED node, the scenario launcher, the
acceptance checklist, screenshots and video, pitch timing, contribution evidence.
**If hardware fails, owns the on-screen device node instead** — the role does not
disappear with the hardware.

**Uses:** MicroPython or Arduino MQTT only if already feasible; test scripting;
screen recording.

**Ignores:** mains wiring, sensors needing calibration, new frameworks.

**Testable output:** the physical or on-screen node obeys the same command; the
scripted demo succeeds three times; a backup video and evidence folder exist.

**Deadlines:** fallback node **hour 8**; physical node **hour 24 or abandoned**;
demo pack **hour 38**.

---

## Dependency discipline

The point of all of this is that no one is ever blocked.

- **M4 starts against a saved JSON fixture.** The UI never waits for the backend.
- **M2 starts against a one-page schema and a local broker.** The fleet never
  waits for CP-SAT.
- **M1 integrates a pure planner function.** Network code never enters
  optimisation code.
- **M5 has a hard hardware kill point at hour 24.** After that, no physical
  debugging beyond a two-minute reconnect check.
- **Everyone owns their tests and a twenty-second explanation of their subsystem.**

The hour-24 hardware kill point is not pessimism. It is the thing that stops one
person's soldering problem from becoming five people's Sunday morning.
