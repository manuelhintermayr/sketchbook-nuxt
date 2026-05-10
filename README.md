<p align="center">
	<a href="https://projects.manuelhintermayr.com/sketchbook-nuxt/"><img src="./public/img/thumbnail.png"></a>
	<br>
	<a href="https://projects.manuelhintermayr.com/sketchbook-nuxt/">Live demo (Nuxt edition)</a>
	<br>
	<a href="https://projects.manuelhintermayr.com/sketchbook-upgraded/">Live demo (Webpack edition)</a>
	<br>
	<a href="https://github.com/manuelhintermayr/sketchbook-upgraded">Original webpack/vanilla-TS edition (sketchbook-upgraded)</a>
	<br>
</p>

# Sketchbook (Nuxt edition)

Sketchbook is a small web-based 3D game engine built on [three.js](https://github.com/mrdoob/three.js) and [cannon-es](https://github.com/pmndrs/cannon-es) — third-person controls, vehicles, scripted scenarios, NPCs, races, animals, and a day/night world. This repository ships the **Nuxt 4 + Vue 3 SFC** edition of the engine; every UI surface is now a Vue component, every cross-cutting state is a Vue composable, every overlay is built from Nuxt UI primitives.

> **Heritage.** This is a 1:1 port of the [`manuelhintermayr/sketchbook-upgraded`](https://github.com/manuelhintermayr/sketchbook-upgraded) webpack edition (itself a maintained extension of [`swift502/Sketchbook`](https://github.com/swift502/Sketchbook) with merged community-fork features). The engine, physics, scenes and gameplay are byte-for-byte the same; what changed is the **shell** around them — DOM/CSS-by-hand became Vue components, lil-gui-only controls became reactive composables, and `localStorage` plumbing became `useUserPrefs` / `useEngineParams`. Engine TypeScript classes (`World`, `Character`, `Vehicle`, `Sky`, `Ocean`, …) are otherwise unchanged.
>
> The timeline of upstream merges (Inthenew / socketControl / Notblox / Joycon / cjmott / swift502) is documented in the [upstream sketchbook-upgraded README](https://github.com/manuelhintermayr/sketchbook-upgraded#project-timeline) and is not duplicated here.

## Features

### World

- Day / night cycle with a sky shader, sun position controls, and a black space backdrop above the launch apex.
- Earth and Moon visible as celestial bodies; lunar gravity (~1.62 m/s²) kicks in on the moon.
- 2000-star night sky (camera-anchored shell, additive twinkle shader) — fades in as the sun drops, full brightness in space.
- Wave-based ocean with vertex displacement and a height query that boats actually ride.
- Procedural [300k-blade grass field](https://www.eddietree.com/grass) (instanced, 30-unit LOD) — wired to any map material called `grass`.
- 3D positional audio sources (`Speaker`) with browser-autoplay handling.
- Procedural engine sound per vehicle (sawtooth + square exhaust + filtered noise intake; per-type profiles for car / heli / airplane / boat / rocket); RPM scales with chassis speed.
- Procedural ambient soundscape — wind (filtered noise) and water (LFO-swept bandpass), water gated to camera proximity (only audible within 10 m of the ocean's y-level).
- Per-character positional SFX: footsteps (walk + sprint cadence), jump kickoff, landing thump (force-scaled), door clunk — each character (player + NPCs) carries its own `THREE.PositionalAudio` so steps fade with distance instead of playing flat.
- Procedural sound-effects bus for the player-UI events: race checkpoint ping + lap fanfare, dialog whoosh, prompt + pause UI ticks, iris-transition whoosh, vehicle crash (impact-throttled), rocket-liftoff boom. All signal-generated, no asset files.
- Bundled background music — looped shuffle through three tracks generated with [Suno AI](https://suno.com/), gated by `Background_Music` and scaled by `Master_Volume * Music_Volume`.
- One **Master Audio** mute switch (toggleable from the title screen, the Settings modal, and the debug panel — all three mirror through `localStorage`). When off every audio source goes silent: continuous synths via the master-volume helper, 3D-positional sources via the THREE listener gain.
- Variable timescale, FXAA, cascaded shadow maps, adjustable gravity (0–2×).
- Camera shake on vehicle hard landings (sineNoise-based, three presets: collision / land / boost).
- All settings persist to `localStorage` with a one-click reset.
- Iris-wipe transition (CSS clip-path circle, 700 ms) when switching maps, restarting a scenario, or reloading from the pause menu.
- Optional depth-Sobel outline overlay (toon look) — toggle in Settings.

### Characters & NPCs

- Third-person camera, raycast capsule controller, full state machine (Sprint, Walk, Idle, Jump, Falling, Drop variants…).
- AI path-following — same convention used by both the AI vehicle drivers and standing/wandering NPCs.
- Name labels float above every character via a CSS2D pass; the player is tagged "You" / "Du" / "Tú" depending on the locale and stands out in blue.
- Two example NPCs walk a small loop at the default spawn, two more flank the player on idle.
- Wandering dogs & cats around the spawn area (1 dog + 2 cats, kept calm by design), with hierarchical low-poly models (per-limb walk / run / jump / idle-breathe animation), procedural voices (bark / meow / purr-loop near tamed cats), and dynamic cannon-sphere bodies so they collide with the player and each other. Dogs notice and bark, cats flee, both can be tamed; tame pets follow the player and turn to track them.
- Flying birds with per-bird positional FM-chirp audio (cat-game-style orbit motion, sin-flap wings, kinematic cannon body) — chirps fade with distance from each bird.
- Ambient butterflies on a Lissajous drift around the player, distance-culled at 30 m, kinematic cannon body.
- Distance-culled CSS2D world labels via a central registry — one **Labels** toggle controls every floating tag (player, NPC names, dogs and cats — all translated through i18n); hides past 10 m to keep the UI quiet at distance.

### Vehicles

- Cars (with per-vehicle tuning sliders for friction, suspension, damping and engine force).
- Airplanes, helicopters.
- Boats with wave-riding physics and wave-aware AI path-following.
- Rocketship — 4-stage liftoff, smoke particle trail, planet-selection modal, automated Earth↔Moon transfer with soft auto-landing.
- Stuck / flip auto-recovery for player vehicles (lifts and yaw-resets after 6 s of no movement under throttle, or 3 s upside-down). Boats / Rocket opt out; air vehicles use flip-only.

### UI (Vue / Nuxt UI)

- **TitleScreen** with bouncing-cube animation + language picker (en / de / es), dark-mode toggle and sound-mute toggle. Gates audio autoplay on the first user gesture.
- **LoadingScreen** with live percentage and progress bar driven by `LoadingManager`.
- **PauseMenu** on Esc (timeScale=0, exits pointer lock) — Resume / Settings / Restart Scenario / Reload.
- **SettingsModal** with General / Graphics / Audio / Controls cards (language picker, dark mode and a settings reset live in General) — writes through reactive `useEngineParams` so the existing `onChange` handlers fire.
- **Branching NPC dialog** with typewriter reveal (28 ms cadence) — click bar or press E / Enter / Space to skip, choices appear after typing finishes.
- **ErrorOverlay** catches `window.onerror` + `unhandledrejection` into a frosted card with stack + Reload + Copy details.
- **DebugPanel** — Vue port of the lil-gui control surface (collapsible folders, sliders, toggles, selects). Reactive — every control binds to `useEngineParams()` and feeds the engine through the same param object the original lil-gui wrote to.
- **GithubCorner**, **ControlsOverlay**, **LapCounter**, **PlanetMenu**, **StatsBox** — independent HUD pieces.
- Centralised design tokens (`app/assets/css/tokens.css`) with `class="dark"` on `<html>` for dark mode.

### Scenarios & Maps

- Free-roam (default and aviation), Oval / Tunnel / Figure-8 car races, Boat Race, stunt ramps.
- Curve-based race-checkpoint system with a HUD lap counter.
- Switchable maps from the **Map & Scenarios** debug panel (persists across reloads):
	- `Inthenew (v0.6, default)` — bundled extended map (helipad spawn, races, marina, rocket island, day-night skybox).
	- `swift502 v0.1 (foundation)` — procedural recreation of the original 2018 demo.
	- `swift502 v0.2 (test world)` — `world_v02.glb`, original spawn + Bob + John.
	- `sketchbook v0.3 (socketControl)`, `sketchbook v0.4 (socketControl)` — race tracks, ramps, runways, helipad with later socketControl tweaks.
	- Four code-built sandboxes from socketControl: `test`, `test2`, `test3`, `example`.
- Compatibility with the [official three.js editor](https://threejs.org/editor/) — the sandbox project file is vendored upstream in [`sketchbook-upgraded/ThreejsEditor/`](https://github.com/manuelhintermayr/sketchbook-upgraded/tree/master/ThreejsEditor).

### Authoring & extensibility

Map markers in `userData` light up code-side features automatically. Full reference in [`docs/map-authoring.md`](./docs/map-authoring.md). Quick sample:

| Marker | Effect |
|---|---|
| `material.name === 'grass'` | Instanced grass field |
| `userData.data === 'speaker'` + `audio` | 3D positional audio source |
| `userData.type === 'cylinder'` | CANNON cylinder collider |
| `userData.type === 'shape'` + `subtype: box`/`sphere` | Dynamic physics primitive |
| `userData.type === 'npc'` / `character_ai` / `character_follow` | Standing or path-following NPC |

### Input

- Keyboard + mouse, free camera (`Shift+C`, `T` to teleport, `Z` to toggle the controls overlay).
- Joy-Con / gamepad via [benhatsor/joycon.js](https://github.com/benhatsor/joycon.js).
- On-screen touch controls (virtual joystick + context-aware action buttons + drag-to-look) — auto-mounted on touch devices, dispatches synthesised keyboard + mouse events so the engine stays input-source-agnostic. Activated on the first real touch via `useTouchMode()`; gracefully degrades to keyboard mode the moment a hardware key is pressed.
- i18n: English / Deutsch / Español with a language picker on the title screen; choice persists in `localStorage`. Every overlay (pause menu, settings modal, error overlay, dialog, prompts, title-screen prompt) is translated through `@nuxtjs/i18n` with flat per-locale JSON files.

## Stack

- **Nuxt 4.4** (SPA — `ssr: false`, the engine is browser-only) with Vue 3 SFCs.
- **[Nuxt UI 4](https://ui.nuxt.com/)** for design primitives (`<UApp>`, `<UButton>`, modal teleports, toasts).
- **[@nuxtjs/i18n 10](https://i18n.nuxtjs.org/)** with lazy locale loading (`en.json` / `de.json` / `es.json`).
- **[@vueuse/core / @vueuse/nuxt](https://vueuse.org/)** for `useColorMode`, event-listener composables, etc.
- **three.js r183** + **cannon-es** + **stats.js** for the engine.
- **TypeScript 6**, ESLint, tabs / single quotes / Allman braces.

The engine itself is plain TypeScript classes under `engine/`; the Vue side under `app/` consumes them through a thin reactive bridge (`engineState()` + `bindEngineState(impl)` set up by `EngineHost.vue` on mount).

## Running locally

```bash
npm install                # once
npm run dev                # vite dev server at http://localhost:3000
```

Production:

```bash
npm run build              # builds .output/
npm run preview            # serves the built app for testing
# or:
npm run generate           # static SPA export to .output/public/
npx serve .output/public   # any static server works
```

Lint / type-check:

```bash
npm run lint
npm run typecheck
```

Heavy CSS animations + the entire WebGL pipeline run in a regular browser tab — no SSR, no hydration. Vue is just the UI shell on top.

## Project layout

```
.                                     ← repo root
├── app/                              ← Vue side (SFCs + composables + assets)
│   ├── app.vue                       ← <UApp> root
│   ├── pages/index.vue               ← <EngineHost />
│   ├── components/
│   │   ├── game/EngineHost.vue       ← engine boot, reactive bridge wiring
│   │   ├── title/                    ← TitleScreen + LanguagePicker
│   │   ├── modals/                   ← Pause, Settings, WelcomeModal, ScenarioWelcome,
│   │   │                                EmptyWorld, WebglWarning, ErrorOverlay, BaseModal
│   │   ├── hud/                      ← LoadingScreen, ControlsOverlay, IrisTransition,
│   │   │                                LapCounter, PlanetMenu, GithubCorner
│   │   ├── debug/                    ← DebugPanel + DebugSlider/Toggle/Select/Folder/Button
│   │   │                                + StatsBox (mounts stats.js DOM)
│   │   ├── dialog/DialogBox.vue
│   │   ├── touch/TouchControls.vue
│   │   └── atoms/                    ← CubeLoader, IconButton, KeyCap, SbCard
│   ├── composables/                  ← reactive engine-state singletons
│   │   ├── useUserPrefs, useEngineParams, useGameLifecycle, useScenarios,
│   │   │   useScenarioState, usePauseMenu, useSettingsModal, useStartupModals,
│   │   │   useDialog, useDialogTypewriter, useProximity, useHud, useIris,
│   │   │   useLoadingState, useRaceState, useTouchMode, useEngineHost,
│   │   │   useErrorOverlay, useControls
│   ├── plugins/                      ← Nuxt-side bootstrap (i18n locale, error-overlay)
│   └── assets/css/                   ← tokens.css, base.css, responsive.css, main.css
├── engine/                           ← three.js / cannon-es engine (plain TS)
│   ├── sketchbook.ts                 ← public bundle entry (re-exports World, sandboxes)
│   ├── characters/                   ← Character + state machine + AI
│   ├── core/                         ← LoadingManager, InputManager, CameraOperator,
│   │                                    CameraShake, FunctionLibrary, UIManager
│   ├── enums/                        ← EntityType, CollisionGroups, UpdateOrder,
│   │                                    SeatType, Side, Space, RenderLayers
│   ├── i18n/                         ← engine-side t() lookup (mirrors @nuxtjs/i18n keys)
│   ├── interfaces/                   ← IUpdatable, IWorldEntity, ISpawnPoint, ICollider
│   ├── physics/colliders/            ← Box, Sphere, Cylinder, Capsule, Trimesh wrappers
│   ├── state/                        ← engine-state bridge contract (engineState(),
│   │                                    bindEngineState(impl)), used by engine code to
│   │                                    talk to the Vue side without importing it
│   ├── vehicles/                     ← Vehicle + Car/Helicopter/Airplane/Boat/RocketShip
│   │                                    + StuckRecovery + VehicleAudioBridge + WheelManager
│   └── world/                        ← World, scenes, audio, animals, scenarios, spawns
│       ├── World.ts                  ← orchestrator
│       ├── Sky/Ocean/Grass/...       ← visual environment
│       ├── setup/                    ← bootstrapHTML, RendererPipeline, ParamsBootstrap,
│       │                                MapSwitcher, DefaultNPCInjector, AnimalInjector,
│       │                                BirdInjector, ButterflyInjector
│       ├── loading/SceneLoader.ts    ← GLTF userData dispatcher
│       ├── scenarios/                ← Scenario, Path, PathNode, defaultDialogs
│       ├── spawn/                    ← Character/NPC/Vehicle/Shape SpawnPoint, ShapeEntity
│       ├── audio/                    ← ProceduralAudio + EngineSound + AmbientSound + …
│       ├── animals/                  ← WanderingAnimals + DogBuilder/CatBuilder + Birds + Butterflies
│       └── ui/WorldLabels.ts         ← CSS2D label registry (engine-side; Vue components for the rest)
├── i18n/locales/                     ← en.json, de.json, es.json (flat tables)
├── public/                           ← static assets served by Vite at /
│   ├── assets/                       ← world.glb + vehicle GLBs + ao_bake + credits_sign
│   ├── audio/                        ← horn.wav + music/
│   ├── img/                          ← Earth/Moon textures, smoke, thumbnail, grass/, water/
│   ├── vendor/joycon/                ← joycon-sketchbook + Client.js + Joycon.min.js
│   └── favicon.ico
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

## Documentation

Beyond this README, the Nuxt edition carries the same family of complementary docs the upstream Webpack edition does — pick the one that matches what you're doing:

- [`docs/architecture.md`](./docs/architecture.md) — engine internals + the engine ↔ Vue bridge: module layers, the per-frame loop, the `UpdateOrder` slot table, World construction, lifecycle interfaces, physics, rendering, audio, the reactive bridge contract, and persistence layout.
- [`docs/map-authoring.md`](./docs/map-authoring.md) — full reference for the `userData` markers `loadScene` recognises.
- [`docs/ui-system.md`](./docs/ui-system.md) — design tokens (`tokens.css`) catalogue and the Vue-component overlay walkthrough.
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code session memory specific to the Nuxt edition.
- [`context.md`](./context.md) — the same orientation primer for any other AI coding assistant (Cursor, Continue, Aider, Copilot Workspace, …).

## Credits

The engine and gameplay are 100 % the upstream Webpack edition's work — see the [upstream sketchbook-upgraded credits](https://github.com/manuelhintermayr/sketchbook-upgraded#credits) for the full attribution chain. The Nuxt port is one author's reshaping of the shell layer:

- [swift502](https://github.com/swift502) — original Sketchbook engine (2018–2024).
- [cjmott](https://github.com/cjmott) — toolchain revival (cannon-es, modern three.js).
- [Inthenew](https://github.com/Inthenew) — boats, wave ocean, races, day/night cycle, rocketship + moon, lunar gravity (v0.6.0 feature set).
- [Bar Hatsor](https://github.com/barhatsor) — Joy-Con / gamepad integration.
- [tkkaushik369](https://github.com/tkkaushik369) — socketControl: race-checkpoint system, instanced grass, Speaker, CylinderCollider, ShapeSpawnPoint, sandbox scenes, THREE.js editor workflow.
- [iErcann](https://github.com/iErcann) — Notblox: TriggerCube + ProximityPrompt design.
- [manuelhintermayr](https://github.com/manuelhintermayr) — extended sketchbook-upgraded baseline (v0.5–v0.8) and the Nuxt port.
