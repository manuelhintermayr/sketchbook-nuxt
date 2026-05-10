# context.md — AI agent onboarding (Nuxt edition)

This file is a generic context primer for any AI coding assistant working on the Nuxt edition of Sketchbook (Cursor, Continue, Aider, Copilot Workspace, agent-mode Claude, etc.). [Claude Code](https://claude.com/claude-code) reads `CLAUDE.md` instead — same content, slightly different framing.

The Nuxt edition is a 1:1 port of the upstream `manuelhintermayr/sketchbook-upgraded` Webpack edition. Engine TypeScript classes are unchanged; the **shell** is now Vue 3 SFCs + composables + Nuxt UI primitives.

## TL;DR for fast bootstrapping

- **What:** Vue 3 / Nuxt 4 SPA shell over a three.js + cannon-es engine. Single-player only (no networking).
- **Stack:** Nuxt 4.4, Vue 3, Nuxt UI 4, `@nuxtjs/i18n` 10, `@vueuse/core` + `@vueuse/nuxt`, three.js r183, cannon-es. TypeScript 6, ESLint enforced.
- **Branch:** `feature/nuxt-upgrade` is the active development line. The parent repo's `master` and the legacy Webpack edition are at the repo root.
- **Build:** `cd nuxt/ && npm install && npm run dev` → <http://localhost:3000>. SSR is **off**; everything is a SPA.
- **Production:** `npm run build && npm run preview` (or `npm run generate && npx serve .output/public`).
- **Lint:** `npm run lint` (ESLint over `app/` + `engine/`).
- **Type-check only:** `npm run typecheck`.

## Repository tour

```
nuxt/
├── nuxt.config.ts                      ← ssr: false, modules: @nuxt/ui + @nuxtjs/i18n + @vueuse/nuxt
├── package.json                        ← scripts: dev / build / generate / preview / lint / typecheck
├── app/                                ← Vue side (the shell)
│   ├── app.vue                         ← <UApp><NuxtPage /></UApp>
│   ├── pages/index.vue                 ← only one page: <EngineHost />
│   ├── components/
│   │   ├── game/EngineHost.vue         ← engine boot + reactive bridge wiring
│   │   ├── title/                      ← TitleScreen, LanguagePicker
│   │   ├── modals/                     ← BaseModal + Pause + Settings + Welcome +
│   │   │                                  ScenarioWelcome + EmptyWorld + WebglWarning +
│   │   │                                  ErrorOverlay
│   │   ├── hud/                        ← LoadingScreen, ControlsOverlay, IrisTransition,
│   │   │                                  LapCounter, PlanetMenu, GithubCorner
│   │   ├── debug/                      ← DebugPanel + DebugSlider/Toggle/Select/Folder/Button
│   │   │                                  + StatsBox (mounts stats.js dom)
│   │   ├── dialog/DialogBox.vue
│   │   ├── touch/TouchControls.vue
│   │   └── atoms/                      ← CubeLoader, IconButton, KeyCap, SbCard
│   ├── composables/                    ← reactive engine-state singletons
│   │   ├── useUserPrefs                ← locale, darkMode, soundMuted (localStorage-backed)
│   │   ├── useEngineParams             ← reactive proxy over lil-gui params
│   │   ├── useGameLifecycle            ← register/unregister modal id; pauses engine
│   │   ├── useScenarios                ← scenario list + register/clear
│   │   ├── useScenarioState            ← onMoon, planetMenuOpen, activeScenarioId, planet-select handler
│   │   ├── usePauseMenu                ← visible, enabled, open/close/toggle, restart/settings handlers
│   │   ├── useSettingsModal
│   │   ├── useStartupModals            ← welcome, empty, webgl, scenarioWelcome - each open() returns Promise
│   │   ├── useDialog + useDialogTypewriter
│   │   ├── useProximity                ← nearInteractCount, nearDialogCount
│   │   ├── useHud                      ← uiContainer, controlsOverlay, fps, debugStack
│   │   ├── useIris                     ← open/close iris-wipe, returns Promise
│   │   ├── useLoadingState             ← visible, progress, message
│   │   ├── useRaceState                ← lap counter
│   │   ├── useTouchMode                ← active flag, enter/exit
│   │   ├── useEngineHost               ← shared world ref
│   │   ├── useErrorOverlay
│   │   └── useControls                 ← controls-overlay row data
│   ├── plugins/                        ← Nuxt-side bootstrap (i18n locale, error-overlay)
│   └── assets/css/                     ← tokens.css, base.css, responsive.css, main.css
├── engine/                             ← three.js / cannon-es engine (plain TS classes)
│   ├── sketchbook.ts                   ← public bundle entry
│   ├── characters/                     ← Character + state machine + AI behaviours
│   │                                      + CharacterPhysicsBridge + CharacterInputBridge
│   ├── core/                           ← LoadingManager, InputManager, CameraOperator,
│   │                                      CameraShake, CommonControls, UIManager,
│   │                                      FunctionLibrary
│   ├── enums/                          ← EntityType, CollisionGroups, SeatType, Side, Space,
│   │                                      UpdateOrder (semantic slots), RenderLayers
│   ├── i18n/                           ← engine-side t() shim that mirrors @nuxtjs/i18n keys
│   ├── interfaces/                     ← IUpdatable, IWorldEntity, ISpawnPoint, ICollider
│   ├── physics/colliders/              ← Box, Sphere, Cylinder, Capsule, Trimesh wrappers
│   ├── state/                          ← bridge contract: engineState() + bindEngineState(impl)
│   ├── vehicles/                       ← Vehicle + Car/Helicopter/Airplane/Boat/RocketShip
│   │                                      + StuckRecovery + VehicleAudioBridge + WheelManager
│   └── world/
│       ├── World.ts                    ← orchestrator; ~650 LOC
│       ├── Sky/Ocean/Grass/...         ← visual environment entities
│       ├── OutlineEffect.ts            ← depth-Sobel toon outline post-process
│       ├── RaceCheckpoint.ts, RaceContent.ts
│       ├── ProximityPrompt.ts          ← E-to-interact prompt (engine-driven DOM)
│       ├── setup/                      ← bootstrapHTML, RendererPipeline, ParamsBootstrap,
│       │                                  MapSwitcher, DefaultNPCInjector,
│       │                                  AnimalInjector, BirdInjector, ButterflyInjector
│       ├── loading/SceneLoader.ts      ← GLTF userData dispatcher
│       ├── scenarios/                  ← Scenario, Path, PathNode, defaultDialogs
│       ├── spawn/                      ← Character/NPC/Vehicle/Shape SpawnPoint, ShapeEntity
│       ├── audio/                      ← ProceduralAudio + EngineSound + AmbientSound + …
│       ├── animals/                    ← WanderingAnimals + DogBuilder + CatBuilder
│       │                                  + AnimalAnimator + AnimalSpawner + Birds + Butterflies
│       ├── sandboxes/                  ← BaseScene + TestScene + Test2 + Test3 + ExampleScene
│       └── ui/WorldLabels.ts           ← CSS2D label registry (engine-side; rest is Vue)
├── i18n/locales/                       ← en.json, de.json, es.json (flat tables)
├── public/                             ← static assets copied to .output/public
└── tsconfig.json
```

Assets (`world.glb`, vehicle GLBs, `moon-with-flowers.png`, etc.) live in the parent repo's `build/assets/` and are served via Vite's `@fs` allow-list — no duplication.

## Project conventions (do not violate without asking)

| Topic | Convention |
|---|---|
| Indent | tabs |
| Quotes | `'single'` |
| Braces | Allman (opening on new line) |
| Semicolons | always |
| Comments | sparse, *why*-focused, no PR/commit refs |
| Engine ↔ Vue split | engine never imports `vue` / `~/composables`; Vue talks to engine through `engineState()` only |
| Composables | module-level singletons re-exported through `useX()` getter; no per-component state |
| Imports | `~/engine/...` from app, `~/composables/...` from app, no app imports from engine |
| New files | extend existing first; no new `.md` unless requested |
| Branches | work on `feature/nuxt-upgrade`; parent repo's `master` is the legacy edition |
| Emojis | none in code/commits unless user requests |
| ECS / Multiplayer | **not adopted** — explicitly out of scope |

## Engine ↔ Vue bridge (the single most important contract)

```
engine/state/index.ts                    ← interface only, no Vue
    interface EngineStateBridge {
        loading: { setVisible, setProgress, setMessage };
        hud: { setUiContainer, setControlsOverlay, setFps, setDebugStack, toggleControlsOverlay };
        race: { setLap };
        scenario: { setOnMoon, setPlanetMenuOpen, setActiveScenarioId, setPlanetSelect };
        scenarios: { register, clear };
        controls: { setRows };
        startupModals: { showWelcome, showEmpty, showWebglWarning, showScenarioWelcome };
        pause: { setEnabled, ... };
        // ... etc
    }
    let impl: EngineStateBridge = STUB;
    export function engineState(): EngineStateBridge { return impl; }
    export function bindEngineState(next: EngineStateBridge): void { impl = next; }

EngineHost.vue (Vue side)                ← onMounted: bindEngineState({...closures over composables...})
                                         ← onUnmounted: bindEngineState(STUB)
```

Engine code calls `engineState().scenarios.register(entry)` — that resolves to the closure that pushes into `useScenarios()`'s reactive list. The engine never imports `useScenarios`, never imports `vue`. The Vue side never reaches into the engine's private state.

When you add a new piece of cross-cutting state:
1. Add the method to `EngineStateBridge` interface in `engine/state/index.ts` (and the no-op stub).
2. Add the closure to the `bindEngineState({...})` call in `EngineHost.vue`.
3. Add the reactive ref + setter to a composable (existing or new).
4. Engine code calls `engineState().yourGroup.yourSetter(value)`.

## Engine mental model

Same per-frame loop as the parent edition (the engine is unchanged):

- **Frame loop:** `World.render()` (RAF) → `World.update(timeStep)` → every registered `IUpdatable.update()` sorted by `updateOrder` → `tickRenderPipeline(world)` runs `composer.render()` (FXAA only) → `outlineEffect.renderPass()` (if Outlines on) → `labelRenderer.render()` (CSS2D name tags).
- **Update order slots:** named in `engine/enums/UpdateOrder.ts` — `CharacterPhysics → VehiclePhysics → Input → Camera → Environment → Scenarios → World → Audio → Triggers → Prompts → Labels → PostCamera`. Spaced by 10 so new slots can squeeze between two existing ones.
- **Pause:** `world.setTimeScale(0)` freezes everything. `PauseMenu.vue` calls this through `useGameLifecycle`.
- **Updatables:** anything visible (Ocean, Grass, Speaker, RaceContent, Sky, Character, Vehicle, WanderingAnimals, etc.) implements `IUpdatable` and is registered via `world.registerUpdatable()` (or `world.add()` which also registers).
- **Map authoring:** scenarios + spawns + physics + paths + grass + speakers all come from `userData` on nodes inside `world.glb`. The dispatcher is `loadScene(world, lm, gltf)` in `engine/world/loading/SceneLoader.ts`. Markers are documented in `docs/map-authoring.md`.

## Where to add things

| You want to… | Touch this |
|---|---|
| Add a new vehicle | `engine/vehicles/`, register in `EntityType`, recognise in `engine/world/spawn/VehicleSpawnPoint` |
| Add a new world entity | implement `IUpdatable` (or `IWorldEntity`), pick an `UpdateOrder` slot, add to `engine/world/loading/SceneLoader.ts` if map-driven |
| Add a UI overlay | new file in `app/components/<area>/YourOverlay.vue`, declare a composable singleton if the overlay needs cross-cutting state, expose a bridge method if the engine needs to open / close it |
| Add a setting | extend `params` defaults in `engine/world/setup/ParamsBootstrap.ts`; `useEngineParams` exposes the reactive proxy automatically; add a row to `SettingsModal.vue` if it should be user-facing |
| Add an NPC dialog | edit `engine/world/scenarios/defaultDialogs.ts`, hand it to `NPCSpawnPoint` constructor |
| Add a new map marker convention | add a `userData.data === 'X'` branch in `engine/world/loading/SceneLoader.ts` and document it in `docs/map-authoring.md` |
| Add a new spawn type | new file in `engine/world/spawn/` implementing `ISpawnPoint`, dispatch from `SceneLoader.ts` |
| Add a new translation | add the key to `i18n/locales/en.json` (+ `de.json`, `es.json`); use `t('your.key')` in components, `t('your.key')` in engine via the `engine/i18n` shim |
| Add a new bridge method | extend `EngineStateBridge` in `engine/state/index.ts`, wire the closure in `EngineHost.vue`, add the reactive backing in a composable |

## Hard rules

1. **Do not** introduce networking, ECS frameworks, or Socket.io.
2. **Do not** make engine code import from `~/composables/` or `'vue'`. Bridge contract only.
3. **Do not** rename or move existing public API (`Sketchbook.World`, scene class exports) without checking call sites in `EngineHost.vue` and the parent edition.
4. **Do not** vendor copyrighted assets without checking license. The Inthenew port replaced six hotlinked images with DALL-E equivalents specifically because of this — see the parent repo's `README.md` v0.6.0 section.
5. **Do not** add `*.md` documentation files spontaneously. The user will ask.
6. **Do not** turn SSR back on. The engine is browser-only — it imports three.js + Web Audio + DOM APIs synchronously at module load.

## Reference docs

- `README.md` — Nuxt-edition feature list, stack, project layout, run instructions.
- `CLAUDE.md` — Claude Code memory (~ same content as this file, slightly different audience).
- `docs/architecture.md` — deeper engine internals + bridge layout.
- `docs/map-authoring.md` — full userData marker reference.
- `docs/ui-system.md` — design tokens + Vue-component overlay catalogue.
- The parent repo's `README.md`, `CHANGELOG.md`, `docs/` cover the upstream Webpack edition's history; reach for them when you need to know **why** an engine choice exists.

## When unsure

Read `README.md`'s heritage note first — it explains why the shape is what it is. Then `git log --oneline` on the relevant file. Most architectural choices are documented in commit messages with the upstream author preserved where applicable.
