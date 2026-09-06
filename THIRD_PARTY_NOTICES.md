# Third-Party Notices

**sketchbook-nuxt** is the **Nuxt 4 + Vue 3 SFC** edition of the Sketchbook engine.
It is a 1:1 port of [`manuelhintermayr/sketchbook-upgraded`](https://github.com/manuelhintermayr/sketchbook-upgraded),
which is itself a maintained extension of the original
[`swift502/Sketchbook`](https://github.com/swift502/Sketchbook) with features merged
from several community forks. This document records that heritage and the
third-party libraries, and separates them from this port's own work.

## 1. License of this repository

Distributed under the **MIT License** (see [LICENSE](./LICENSE)),
**Copyright (c) 2020 swift502**. The original author's copyright notice is
preserved unchanged. The Nuxt/Vue shell contributed in this repository is provided
under the same MIT License.

## 2. Engine heritage and upstream attribution

The engine, physics, scenes, and gameplay are byte-for-byte the upstream Webpack
edition's work. What changed in this repository is the **shell** (DOM/CSS →
Vue components, lil-gui → reactive composables, `localStorage` plumbing).

The full upstream / fork attribution chain is documented in the base project:

- [`manuelhintermayr/sketchbook-upgraded` — README timeline](https://github.com/manuelhintermayr/sketchbook-upgraded#project-timeline)
- [`manuelhintermayr/sketchbook-upgraded` — THIRD_PARTY_NOTICES.md](https://github.com/manuelhintermayr/sketchbook-upgraded/blob/master/THIRD_PARTY_NOTICES.md)

Summary of contributors whose work is present via that chain (see the base
project for authoritative license details):

| Project | Author | Contribution | License |
|---|---|---|---|
| [`swift502/Sketchbook`](https://github.com/swift502/Sketchbook) | swift502 | Original three.js / cannon.js engine | **MIT** (© 2020 swift502) |
| [`cjmott/Sketchbook`](https://github.com/cjmott) | cjmott | cannon-es / modern three.js revival | MIT — inherited from `swift502/Sketchbook` |
| [`Inthenew/Sketchbook`](https://github.com/Inthenew) | Inthenew | Boats, ocean, races, day/night, rocketship, Moon | MIT — inherited from `swift502/Sketchbook` |
| [`benhatsor/Joycon-Sketchbook`](https://github.com/benhatsor) | Bar Hatsor | Joy-Con / gamepad integration | MIT — inherited from `swift502/Sketchbook` |
| [`tkkaushik369/socketControl`](https://github.com/tkkaushik369) | tkkaushik369 | Race checkpoints, grass, Speaker, colliders, sandbox scenes, editor workflow | **MIT** (per the base project's timeline) |
| [`iErcann/Notblox`](https://github.com/iErcann) | iErcann | TriggerCube + ProximityPrompt design | See the `iErcann/Notblox` repository |

## 3. Third-party libraries

Each remains under its own license and copyright; refer to the respective project:

- **[three.js](https://github.com/mrdoob/three.js)** — MIT
- **[cannon-es](https://github.com/pmndrs/cannon-es)** — MIT
- **[Nuxt](https://nuxt.com/)**, **[Vue](https://vuejs.org/)**, **[Nuxt UI](https://ui.nuxt.com/)** — MIT
- **[@nuxtjs/i18n](https://i18n.nuxtjs.org/)**, **[@vueuse/core](https://vueuse.org/)**, **stats.js** — MIT
- **joycon.js** (benhatsor) — vendored under `public/vendor/joycon/`; see the upstream project for its license

## 4. Assets

- **Grass field technique** — based on the instanced-grass approach by Eddie Lee
  (<https://www.eddietree.com/grass>).
- **Background music** — bundled tracks generated with [Suno AI](https://suno.com/).

Only assets whose origin is documented in the README, repository, or git history
are listed here; no origin has been invented. See the base project's notices for
the image-asset provenance details.

## 5. Trademarks

Product and project names referenced above are the property of their respective
owners and are used for identification only.
