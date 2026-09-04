# The from-scratch rule

## What the rules say

Official Code2Create rules: **projects and code must be developed during the
event.** Unstop additionally prohibits pre-built projects, prior commits and
reused code.

This conflicts directly with wanting a warm repository on day one. The rules win.
Not because getting caught would be embarrassing, but because a team that has to
be vague about its commit history cannot answer the one question judges always
ask: *"who wrote this part?"*

## What preparation may produce

✅ **Understanding.** Skills, vocabulary, mental models, rehearsed explanations.

✅ **Paper and interface specifications.** The topic contract, payload fields,
state transition tables, planner input/output, acceptance examples. Frozen
decisions are not code.

✅ **Disposable exercises.** Learning code that is written, understood, and then
deleted — explicitly not carried into the event.

✅ **Logistics and process.** Role cards, kill points, branch/merge routine,
packing list, organiser questions.

✅ **Non-product artefacts.** This planning repository, the brand, the project
site. None of it is the competition deliverable.

❌ **Not this:** final project code, prior commits, reusable project modules,
pre-generated implementation, a warm skeleton to `git init` over.

## Why the architecture is empty directories

`services/`, `packages/`, `firmware/`, `infra/` and `tests/` contain nothing but
`.gitkeep` files, and that is the point.

A frozen directory layout is a *decision*, in the same category as the topic
contract and the planner interface — it records what the system will be shaped
like without pre-building any of it. On the day, the team creates a clean
repository and fills that shape in, fast, because the arguing was done in advance.

Preparation that produces structure without producing implementation is exactly
what the rules permit.

## One open question for the organisers

**Do data fixtures and configuration sheets count as pre-built material?**

Device profiles and scenario values are on the boundary. They are closer to
configuration than to code, but a 30-device seeded fixture is a meaningful head
start, and reasonable people would rule differently.

Until that is answered, keep device and gateway values in a **human-readable
planning sheet** — not a JSON file that could be dropped straight into the repo.
Ask at the opening ceremony, then act on the answer.

## The other questions for the opening ceremony

Write these on a card and give it to whoever gets to the front first:

1. Are the event dates 6–8 or 7–9 September? *(Sources conflict.)*
2. Have numerical judging weights been published?
3. How long is the final pitch?
4. Do data fixtures count as pre-built material?
5. Are there sponsor APIs we're expected to use?

## The standard we're holding

Every subsystem is understood by the person who owns it, and every person can
explain theirs in twenty seconds without notes.

AI-assisted coding is explicitly allowed, and we will use it. That does not lower
the bar — it raises it, because the time it saves has to go somewhere, and where
it goes is into understanding the thing well enough to defend it.
