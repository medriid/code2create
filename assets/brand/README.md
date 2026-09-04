# FILAMENT OS brand

Everything here is generated. Edit `build.mjs`, then:

```bash
node build.mjs && node build-preview.mjs
```

`preview.html` is a contact sheet — open it in a browser to check every asset at
every size on both grounds before committing a change.

## The idea

The mark is one wire. Scarce power comes in cold from the bottom left, passes
through three coils of coordination, and leaves as light — a load that actually
got served. That is the whole product in one stroke: capacity in, allocation in
the middle, verified delivery at the end.

The wordmark is bent from the same wire. F, I, L, A, M, E, N and T are drawn as
straight stroked segments; O is one closed loop; S is two tangent circles so the
wire turns without a kink. Same weight, same round caps, same logic as the mark.
Nothing here depends on a font being installed, which matters when the demo
laptop is not yours.

## Files

| File | Use |
|---|---|
| `mark.svg` | The coil alone. Avatars, app icons, the console header, anywhere the name is already nearby. |
| `logo.svg` | Horizontal lockup, for dark backgrounds. The default. |
| `logo-ink.svg` | Horizontal lockup with a dark wordmark, for light backgrounds. |
| `logo-stacked.svg` | Vertical lockup, dark backgrounds. Narrow spaces. |
| `logo-stacked-ink.svg` | Vertical lockup, light backgrounds. |
| `mark-mono.svg` | Single colour via `currentColor`. Print, silkscreen, terminal-adjacent UI. |
| `favicon.svg` | Two fatter loops on a rounded tile. Survives 16 px; the full mark does not. |

## Colour

| Token | Hex | Where |
|---|---|---|
| `--ink` | `#08070a` | Page ground |
| `--ink-2` | `#0d0b10` | Raised surface |
| `--ink-3` | `#14111a` | Cards |
| `--hairline` | `#241f2b` | 1 px borders |
| `--wire` | `#4a5568` | The cold end of the wire |
| `--wire-warm` | `#8a7a6a` | The transition |
| `--glow` | `#ff9f45` | Primary accent |
| `--glow-soft` | `#ffd9a0` | The hot end, highlights |
| `--signal` | `#7cc4ff` | Links, data, secondary accent |
| `--text` | `#f2ede6` | Body text on dark |
| `--text-dim` | `#a49c92` | Secondary text |
| `--paper` | `#f6f4f0` | Light ground |
| `--ink-on-paper` | `#241f1a` | Text on light |

The gradient always runs cold → warm along the direction of travel. Do not
reverse it; the whole point is that the wire ends in light.

In the operations console these same tokens carry state: `--glow` is a pending
command, `--ok` is a verified acknowledgement, `--warn` is stale, and red is
offline or over cap. Never use `--glow` for an error — amber means *working*.

## Type

| Role | Family | Fallback |
|---|---|---|
| Display | Fraunces | `ui-serif, Georgia, serif` |
| Body | Inter | `ui-sans-serif, system-ui, sans-serif` |
| Mono | JetBrains Mono | `ui-monospace, "SF Mono", Menlo, monospace` |

## Rules

- Keep clear space around the lockup equal to the height of the mark's glowing node.
- Never re-colour the wordmark to amber. The mark carries the colour; the words stay neutral.
- Never place `logo.svg` on a light ground or `logo-ink.svg` on a dark one — use the matching variant.
- Below about 40 px, use `favicon.svg` instead of `mark.svg`. Three loops turn to mush.
- The mark may be rotated only as a whole, and only if the wire still ends higher than it starts.
