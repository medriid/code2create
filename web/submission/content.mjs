// Single source of truth for the page. Everything the site says lives here.

export const meta = {
  name: "FILAMENT OS",
  tagline: "Offline coordination for homes, hostels and small microgrids.",
  standfirst: "Five gateways. Thirty devices. One hard power limit.",
  event: "Code2Create 7.0 · ACM-VIT · graVITas '26",
  venue: "Anna Auditorium, VIT Vellore",
  description:
    "A distributed operating layer for flexible electricity demand. Gateways publish flexibility offers, a coordinator allocates scarce power, devices acknowledge, and the system replans when nodes fail.",
};

// The pinned hero. Each scene is scrubbed by scroll position; `cap` and the
// per-home draw values drive the bars, so the hero literally performs the demo.
export const scenes = [
  {
    id: "normal",
    kicker: "00:00",
    title: "Five homes, one feeder",
    body: "A hostel floor, an apartment cluster, a small microgrid. Everyone draws what they want. There is headroom, so nobody has to think about it.",
    cap: 5.0,
    homes: [1.05, 0.82, 1.24, 0.79, 0.7],
    status: "ok",
    note: "4.60 kW drawn · 5.00 kW available",
  },
  {
    id: "drop",
    kicker: "00:20",
    title: "Capacity drops",
    body: "The inverter switches over. The feeder is derated. Available power falls to 1.8 kW and every home is still drawing as though nothing happened.",
    cap: 1.8,
    homes: [1.05, 0.82, 1.24, 0.79, 0.7],
    status: "over",
    note: "4.60 kW drawn · 1.80 kW available · overload",
  },
  {
    id: "monitor",
    kicker: "00:30",
    title: "Monitoring is not control",
    body: "A dashboard turns red and starts a timer. It tells you that you are failing. It does not decide, does not act, and cannot prove that anything recovered.",
    cap: 1.8,
    homes: [1.05, 0.82, 1.24, 0.79, 0.7],
    status: "over",
    note: "the graph knows. nothing else does.",
  },
  {
    id: "offer",
    kicker: "00:40",
    title: "Each home offers, it does not confess",
    body: "A gateway keeps its device list private and publishes one envelope: minimum safe watts, preferred watts, maximum useful watts, deadline energy, and the curtailment it has already absorbed.",
    cap: 1.8,
    homes: [0.42, 0.31, 0.5, 0.3, 0.27],
    status: "planning",
    note: "offers received from 5 gateways",
  },
  {
    id: "plan",
    kicker: "01:10",
    title: "The coordinator allocates",
    body: "Water heaters, the washer and the EV emulator defer. Router, fridge and the protected load stay up. Every command carries a plan id, a version, an expiry and a reason.",
    cap: 1.8,
    homes: [0.4, 0.3, 0.46, 0.28, 0.25],
    status: "ok",
    note: "1.69 kW drawn · under cap in 3.2 s",
  },
  {
    id: "fail",
    kicker: "01:50",
    title: "Gateway C disappears",
    body: "Its heartbeat stops. Its load is not assumed to be zero — it becomes unknown, reserves a conservative budget, and raises an incident. Another household's flexible slot moves.",
    cap: 1.8,
    homes: [0.38, 0.28, null, 0.3, 0.26],
    status: "degraded",
    note: "gateway-c stale · conservative reserve held · replanned",
  },
];

export const sections = {
  problem: {
    eyebrow: "The problem",
    title: "When capacity drops, every home decides alone",
    lede: "The result is an overload, a blunt whole-block shutdown, or one unlucky household absorbing all of the inconvenience.",
    body: [
      "A hostel inverter cuts over to a fraction of its normal capacity. An apartment feeder browns out. A small microgrid loses its main source. These are not rare events — in a lot of the world they are Tuesday.",
      "The devices in each home are perfectly capable of waiting. A water heater does not care whether it runs now or in forty minutes. A washing machine has a deadline, not an urgency. An EV charger is the most flexible load in the building.",
      "But nothing tells them. There is no shared picture of what is scarce, no way for one home to say \"I can wait\" and have that mean anything, and no proof afterwards that the load actually came down.",
    ],
  },

  solution: {
    eyebrow: "What it does",
    title: "A coordination layer, not a dashboard",
    lede: "Gateways publish what they can give up. A coordinator decides who gets what. Devices acknowledge. The system checks, and replans when reality disagrees.",
  },

  boundary: {
    eyebrow: "The boundary",
    title: "FILAMENT OS never switches mains voltage",
    lede: "This goes on the first slide, not buried in a footnote.",
    body: [
      "It is not a smart panel, not an inverter controller, not a certified demand-response platform, and it makes no savings claims.",
      "It is a planning-and-control demonstrator: 20–30 emulated devices across five laptops, plus — if the hardware cooperates — one ESP32 driving a low-voltage LED on exactly the same message contract as every software node.",
    ],
    proves: [
      "Interoperable device messaging",
      "A maintained device twin",
      "Constraint-aware allocation",
      "Closed-loop command verification",
      "Graceful recovery",
    ],
    close: "That is already a serious 48-hour system, and saying so plainly is more convincing than overclaiming.",
  },

  features: {
    eyebrow: "The MVP",
    title: "Five features. Not six.",
    lede: "The greatest danger to this project is scope, so the list is fixed before the clock starts.",
    items: [
      {
        n: "01",
        title: "Device and gateway contract",
        body: "Every node publishes identity, gateway, observed watts, state, flexibility class, priority, deadline, minimum run time, heartbeat and timestamp.",
        key: "The ESP32 uses the same payload as the emulators. If the hardware needs a special case, it has stopped proving anything.",
      },
      {
        n: "02",
        title: "Live twin and health",
        body: "Desired state, observed state, heartbeat age, command version, last acknowledgement — maintained per device by the coordinator.",
        key: "A silent node is never treated as zero load. It becomes unknown, reserves a conservative budget, and raises a visible incident.",
      },
      {
        n: "03",
        title: "Capacity, deadline and fairness planner",
        body: "Twelve five-minute slots. Hard constraints on the cap, minimum runs and protected loads. Deadline jobs finish where feasible.",
        key: "The objective penalises switching, missed deadlines and unequal curtailment between homes.",
      },
      {
        n: "04",
        title: "Closed-loop control and replan",
        body: "Commands carry a plan id, a monotonic version, a target state, an expiry and a reason. Devices answer applied, rejected, duplicate or expired.",
        key: "The coordinator compares desired against observed. Divergence triggers a deterministic replan.",
      },
      {
        n: "05",
        title: "One-screen operations console",
        body: "Cap versus observed load, five gateway cards, device table, plan timeline, fairness indicator, reason codes, pending acknowledgements.",
        key: "The judge gets three controls: change the cap, protect a device, kill a gateway. Nothing else is clickable.",
      },
    ],
  },

  loop: {
    eyebrow: "The loop",
    title: "Sense, decide, command, acknowledge, measure, replan",
    lede: "It cannot be reduced to CRUD screens. That is the whole argument for the project.",
    steps: [
      { n: "1", t: "Telemetry", d: "Schema-validated, appended to the event log." },
      { n: "2", t: "Twin", d: "Observed state and heartbeat age updated." },
      { n: "3", t: "Dirty", d: "A cap event, device change, missing ack or timer marks the plan stale." },
      { n: "4", t: "Plan", d: "A snapshot enters the planner. Output is independently re-validated for cap compliance." },
      { n: "5", t: "Command", d: "Versioned commands publish. The UI shows them as pending immediately." },
      { n: "6", t: "Verify", d: "Acks and later telemetry move pending to verified, rejected or stale." },
      { n: "7", t: "Replan", d: "Unexpected state triggers a replan and a human-readable reason code." },
    ],
    aside: "Step 4 is deliberately paranoid. The planner is the component most likely to be subtly wrong at hour 30, and the one whose mistakes look like success.",
  },

  planes: [
    { t: "Control plane", d: "Versioned MQTT topics on the local LAN.", tone: "glow" },
    { t: "Evidence plane", d: "Append-only SQLite event log you can replay.", tone: "signal" },
    { t: "Operator plane", d: "One screen. Three controls.", tone: "ok" },
  ],

  protocol: {
    eyebrow: "The contract",
    title: "Frozen before the clock starts",
    lede: "Interfaces are a decision, not an implementation — which is exactly what preparation is allowed to produce.",
    topics: `filament/v1/site/{site_id}/gateway/{gateway_id}/status
filament/v1/site/{site_id}/gateway/{gateway_id}/offer
filament/v1/site/{site_id}/device/{device_id}/telemetry
filament/v1/site/{site_id}/device/{device_id}/command
filament/v1/site/{site_id}/device/{device_id}/ack
filament/v1/site/{site_id}/event/capacity`,
    telemetry: `{
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
}`,
    command: `{
  "schema": "filament.command.v1",
  "plan_id": "plan-0042",
  "version": 42,
  "device_id": "washer-1",
  "target_state": "paused",
  "expires_at": "2026-09-07T07:47:00+05:30",
  "reason": "cap_reduction"
}`,
    notes: [
      "Gateway status is retained, so a restarted coordinator immediately sees who exists.",
      "Device commands are not retained. A retained command is a command that fires again at the worst possible moment.",
    ],
  },

  planner: {
    eyebrow: "The planner",
    title: "Constraints first, optimisation second",
    objective: `maximize   delivered utility
         − missed-deadline penalty
         − switching penalty
         − household curtailment-debt penalty`,
    constraints: [
      "Σ scheduled watts in each slot ≤ site capacity for that slot",
      "Protected devices stay on only while the hard system remains feasible",
      "Deadline jobs receive their required slots before their deadline",
      "Minimum run and off rules prevent oscillation",
      "No gateway receives more than its published envelope permits",
      "Stale or unacknowledged loads reserve conservative power until resolved",
    ],
    fallback:
      "The optimiser has a hard wall-clock limit. On timeout the fallback sorts protected, then firm, then flexible, and picks flexible jobs by deadline and accumulated curtailment debt. The fallback is not the lesser path — it is the safety mechanism, which is why it gets built first and CP-SAT slots in behind the same interface.",
  },

  stack: {
    eyebrow: "The stack",
    title: "Every component has a named fallback",
    lede: "Chosen for what happens when it fails, not for what it is called.",
    rows: [
      ["Broker", "Eclipse Mosquitto (MQTT 5)", "Everything on the primary laptop"],
      ["Devices", "Python + paho-mqtt emulators", "One laptop, distinct gateway IDs"],
      ["Gateway", "Python agent", "Fixed local policy on the last valid budget"],
      ["Coordinator", "Python asyncio", "Last good plan"],
      ["Planner", "OR-Tools CP-SAT", "Deterministic greedy, identical output schema"],
      ["Schemas", "Pydantic", "Hand-validated minimum field set"],
      ["Evidence", "SQLite, append-only", "Newline-delimited JSON"],
      ["API", "FastAPI", "Console imports a read-only state adapter"],
      ["Console", "Streamlit + Plotly", "Static seeded state. Never rebuild in React mid-event"],
      ["Physical node", "ESP32 + low-voltage LED", "On-screen LED, same payload"],
    ],
  },

  standards: {
    eyebrow: "Honest scope",
    title: "MQTT, Matter and OpenADR have different jobs",
    lede: "Getting this right in 45 seconds of questioning is worth more than any feature.",
    items: [
      {
        t: "MQTT",
        badge: "built",
        tone: "ok",
        d: "The local event fabric. Lightweight publish/subscribe for machine-to-machine and IoT. Mosquitto implements MQTT 5 and 3.x. This is what we actually build on.",
      },
      {
        t: "Matter",
        badge: "named future adapter",
        tone: "warn",
        d: "A device interoperability direction, not our decision engine. Matter 1.5 added standardised energy pricing, tariff and carbon-intensity information. A future gateway adapter could translate that into FILAMENT's internal model. We do not attempt certification.",
      },
      {
        t: "OpenADR",
        badge: "one illustrative fixture",
        tone: "warn",
        d: "The upstream signal direction — demand-response price, reliability and capacity events between utilities, aggregators and control systems. The MVP uses at most one transparent OpenADR-shaped JSON fixture.",
      },
    ],
    close: "Anyone who claims more in the pitch is creating a question we cannot answer.",
  },

  acceptance: {
    eyebrow: "Done means done",
    title: "Seven criteria, three times in a row",
    items: [
      "Every seeded device appears within 10 seconds of scenario start.",
      "A cap change produces a plan within 1 second. If CP-SAT overruns, greedy answers immediately.",
      "Observed controlled load is under the cap within 5 seconds whenever a feasible plan exists.",
      "Commands are idempotent. Replaying one cannot toggle a device twice.",
      "A killed gateway goes stale within its timeout, turns red, and forces a conservative replan.",
      "If protected demand alone exceeds the cap, the system declares infeasible. It never fabricates compliance.",
      "The same seed produces the same fallback plan and a downloadable trace.",
    ],
  },

  metrics: {
    eyebrow: "Measured, not claimed",
    title: "What appears on screen",
    rows: [
      ["Cap compliance", "% of samples at or below the limit after the grace period"],
      ["Response time", "Cap event → verified below-cap"],
      ["Acknowledgement success", "Applied acks ÷ issued commands"],
      ["Deadline satisfaction", "Flexible jobs completed by their deadline"],
      ["Recovery time", "Failed-node detection → replacement plan"],
      ["Fairness", "Jain's index over delivered ÷ requested flexible energy"],
    ],
    caveat:
      "Fairness is shown only where every denominator is valid. A value near 1 means allocations were similar. It does not prove social fairness, and we do not say that it does.",
  },

  team: {
    eyebrow: "Five people",
    title: "Everyone owns something demonstrable",
    lede: "Testable output, real commit history, and a twenty-second explanation without notes.",
    members: [
      { n: "M1", role: "Advanced builder", owns: "Schemas, coordinator state machine, planner interface, greedy fallback, CP-SAT model, integration, technical defence.", out: "plan(snapshot) passes constraint tests; the command → ack → replan loop completes.", when: "Greedy slice h6 · CP-SAT h18 · freeze h36" },
      { n: "M2", role: "Device fleet", owns: "Config-driven emulator, 20–30 seeded profiles, heartbeat, versioned command handling, duplicate and expired tests.", out: "One command launches five logical homes; every node responds idempotently.", when: "Five nodes h4 · full fleet h10" },
      { n: "M3", role: "Gateway and evidence", owns: "Local broker, gateway aggregation and fallback policy, event logging, replay, topic and LAN monitoring.", out: "Replay reproduces a run; a gateway keeps its last budget when the coordinator stops.", when: "Broker h3 · offers h10 · replay h24" },
      { n: "M4", role: "Operations console", owns: "The one-screen interface, the three judge controls, and legibility at projector resolution.", out: "A judge triggers cap, protect and failure without touching a terminal.", when: "Mock h6 · live h14 · frozen h34" },
      { n: "M5", role: "Physical proof, QA and story", owns: "The optional ESP32 node, scenario launcher, acceptance checklist, video, pitch timing. If hardware fails, owns the on-screen node.", out: "Scripted demo succeeds three times; backup video and evidence folder exist.", when: "Fallback h8 · hardware h24 or killed · demo pack h38" },
    ],
    discipline: [
      "M4 starts against a saved JSON fixture. The UI never waits for the backend.",
      "M2 starts against a one-page schema and a local broker. The fleet never waits for CP-SAT.",
      "M1 integrates a pure planner function. Network code never enters optimisation code.",
      "M5 has a hard hardware kill point at hour 24.",
    ],
  },

  timeline: {
    eyebrow: "48 hours",
    title: "The vertical slice comes before the good algorithm",
    lede: "A working end-to-end loop with a dumb scheduler beats a brilliant scheduler with nothing to command.",
    windows: [
      { h: "0–2", o: "Clean repo, issue board, frozen schemas, broker up, UI shell.", d: "Two processes exchange a validated heartbeat and command.", no: "CP-SAT, hardware, styling, cloud" },
      { h: "2–6", o: "Five devices, message logging, twin, deterministic priority scheduler.", d: "A CLI cap change moves two devices. First vertical slice recorded.", no: "Matter, OpenADR, React" },
      { h: "6–12", o: "20–30 nodes and failure modes. Five gateways and offers. Live state in the UI.", d: "A killed device goes stale; the dashboard shows pending, then verified.", no: "Forecasts, auth, sensor calibration" },
      { h: "12–18", o: "Deadline and fairness planner behind the interface. Idempotency tests. Replay.", d: "Greedy and CP-SAT both produce schema-valid plans.", no: "New device types, redesign" },
      { h: "18–24", o: "Integration and Review 1 hardening. Three scripted scenarios.", d: "Review 1: real messages, the first complete loop. Tag a runnable checkpoint.", no: "Anything called \"nice to have\"" },
      { h: "24–30", o: "Fault injection. Hardware go/kill decision.", d: "The system never silently reports false compliance.", no: "Physical debugging after the kill point" },
      { h: "30–36", o: "UX and evidence. Freeze controls. Export replay. Profile latency.", d: "Review 2 build runs from a clean start script. Three consecutive passes.", no: "Feature additions, library upgrades" },
      { h: "36–42", o: "Feature freeze. Backup video. Rehearse questions.", d: "Versioned release, offline run instructions, demo under 2:50.", no: "Refactors, aesthetic experiments" },
      { h: "42–48", o: "Bug fixes with rollback only. Rest in rotation.", d: "Final build hash, backup, live and recorded demo options.", no: "Schema changes, optimiser redesign" },
    ],
  },

  demo: {
    eyebrow: "Three minutes",
    title: "The judge drives the wow moment",
    lede: "Not a redrawn graph — a stranger changes a number and watches real device state follow it under a hard constraint.",
    beats: [
      { t: "0:00", h: "Problem", d: "Five homes drawing 4.6 kW against a 5 kW cap." },
      { t: "0:20", h: "Existing failure", d: "Uncoordinated mode, cap to 1.8 kW. The feeder turns red and a timer advances." },
      { t: "0:40", h: "Insight", d: "Homes keep device choices local and publish a flexibility offer instead." },
      { t: "1:00", h: "Live demo", d: "Drag the cap. Plan in under a second. Pending dots become verified ticks. The physical light changes." },
      { t: "1:40", h: "Judge control", d: "\"Protect this washer.\" The plan changes elsewhere rather than violating the cap." },
      { t: "1:55", h: "Failure", d: "Kill gateway C. Amber, then red. Conservative reserve. Another household's slot moves." },
      { t: "2:20", h: "Technical", d: "Versioned expiring commands, observed state, constraint set, deterministic fallback, all on the LAN." },
      { t: "2:45", h: "Boundary", d: "Not a certified controller. Next: one real Home Assistant household, and a hostel operator." },
    ],
  },

  failure: {
    eyebrow: "Failure proofing",
    title: "Every failure has a rehearsed answer",
    rows: [
      ["Internet unavailable", "Nothing changes. Broker, planner, UI and devices are all on the LAN.", "Local wheel cache, offline run instructions"],
      ["ESP32 unavailable", "On-screen LED device using the same MQTT payload.", "Video of an earlier run, labelled as recorded"],
      ["ESP32 dies mid-demo", "Use it as the planned failure demonstration. Replan.", "Replay trace"],
      ["Team laptop dies", "Launch that gateway's IDs on the primary laptop.", "Single-laptop profile"],
    ],
    close: "A hardware failure during a live demo is either a disaster or the exact thing you were about to demonstrate on purpose. Which one depends entirely on whether you rehearsed it.",
  },

  // Counted up as they scroll in.
  stats: [
    { n: 5,   suffix: "",     label: "gateways", note: "each fails independently" },
    { n: 30,  suffix: "",     label: "devices", note: "emulated, plus one real" },
    { n: 1,   suffix: " kW",  label: "hard cap", note: "never a suggestion", decimals: 1, from: 5 },
    { n: 800, suffix: " ms",  label: "planner wall clock", note: "then greedy ships" },
    { n: 12,  suffix: "",     label: "five-minute slots", note: "one hour of lookahead" },
    { n: 0,   suffix: " V",   label: "mains switched", note: "by design" },
  ],

  // Full-bleed breaks between sections. The argument, in one line each.
  quotes: [
    { t: "Monitoring tells us we are failing. It does not decide, act, or prove recovery.", cite: "why a dashboard is not a control system" },
    { t: "A silent load is not a load of zero.", cite: "the correctness decision the whole system turns on" },
    { t: "The fallback is not the lesser path. It is the safety mechanism.", cite: "why greedy is built first" },
    { t: "It declares infeasible. It never fabricates compliance.", cite: "acceptance criterion six" },
  ],

  // Every reason a device can be told to change state. Scrolls as a ticker.
  marquee: [
    "cap_reduction", "cap_release", "deadline_risk", "protected",
    "gateway_stale", "min_run_hold", "operator_protect", "replan",
  ],

  rules: {
    eyebrow: "The rules",
    title: "This site is preparation. The code is not written yet.",
    body: [
      "Code2Create requires the project to be built during the event, from scratch, with no prior commits or reused code. That conflicts with wanting a warm repository on day one, and the rules win.",
      "Not because getting caught would be embarrassing, but because a team that has to be vague about its commit history cannot answer the question judges always ask: who wrote this part?",
    ],
    allowed: [
      "Understanding — skills, vocabulary, rehearsed explanations",
      "Paper and interface specifications — the topic contract, payload fields, planner input and output",
      "Disposable exercises — written, understood, then deleted",
      "Logistics and process — role cards, kill points, branch routine",
      "Non-product artefacts — the plans, the brand, this site",
    ],
    forbidden: [
      "Final project code",
      "Prior commits",
      "Reusable project modules",
      "Pre-generated implementation",
      "A warm skeleton to git init over",
    ],
    close:
      "The architecture in the repository is empty directories and .gitkeep files, and that is the point. A frozen layout is a decision in the same category as the topic contract — it records the shape without pre-building any of it. On the day, the team creates a clean repository and fills that shape in fast, because the arguing was done in advance.",
  },

};
