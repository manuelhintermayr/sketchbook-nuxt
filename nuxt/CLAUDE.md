# CLAUDE.md — Claude Code memory for the Nuxt edition of Sketchbook

This file is loaded automatically by [Claude Code](https://claude.com/claude-code) at the start of every session in this directory. Keep it concise and current — re-read it before assuming anything.

## What this dir is

The **Nuxt 4 + Vue 3** edition of Sketchbook. A 1:1 port of the parent repo's `manuelhintermayr/sketchbook-upgraded` Webpack edition: same engine, same gameplay, same maps. What changed is the shell — every UI surface is now a Vue SFC, every cross-cutting state is a composable, every modal is an `<UModal>` from Nuxt UI.

The legacy Webpack edition still lives at the repo root (`../src/`, `../webpack.{dev,prod}.js`). They share the same `build/assets/` GLB / image assets via Vite's `@fs` allow-list — no asset duplication.

Active branch: `feature/nuxt-upgrade`.

## Build / run / lint

```bash
cd nuxt/
npm install                 # once
npm run dev                 # vite dev server, http://localhost:3000
npm run build               # build .output/
npm run preview             # serve .output/ for production smoke-test
npm run generate            # static SPA export to .output/public/
npm run lint                # ESLint over app/ + engine/
npm run typecheck           # nuxt typecheck (faster than full build for sanity checks)
```

`ssr: false` in `nuxt.config.ts` — the engine imports three.js + Web Audio + DOM at module load, so SSR is never going to work. Don't try to enable it.

## Code conventions (match these — don't reformat)

- **Indentation:** tabs. ESLint will complain on spaces.
- **Quotes:** single (`'…'`) in TypeScript, double in HTML attributes (Vue templates default).
- **Semicolons:** always in `.ts`. Vue SFC `<script setup>` blocks also use semicolons; templates don't.
- **Braces:** Allman in `.ts` (opening on new line):
  ```ts
  export class Foo
  {
      constructor()
      {
          ...
      }
  }
  ```
- **Imports:** group per area. Engine code groups: three first, then cannon, then internal `~/engine/...`. Vue components group: vue / vueuse, then auto-imported composables (declared once even though they're auto-imported), then types.
- **Comments:** sparse and *why*-focused. Don't narrate code that names itself. Don't reference issue numbers / commits / "added by X" — that's `git log` territory.
- **No emojis** in code or commits unless the user asks.
- **No new files** without need — prefer extending an existing one. Especially no `*.md` files unless explicitly requested.

## Architecture map

### Vue side (`app/`)

- `app/app.vue` — `<UApp><NuxtPage /></UApp>`. The Nuxt UI root.
- `app/pages/index.vue` — `<EngineHost />`. Single page; SSR is off so this just mounts client-side.
- `app/components/game/EngineHost.vue` — the boot component. Constructs `World`, calls `bindEngineState({...})` with closures over the composables, registers an `onUnmounted` to tear down. Owns the canvas-mounting flow.
- `app/components/title/`, `modals/`, `hud/`, `debug/`, `dialog/`, `touch/`, `atoms/` — UI surfaces. Each component owns its own DOM + scoped CSS, talks to the engine through composables.
- `app/composables/use*.ts` — module-level reactive singletons. `useDialog()` from any component returns the same instance. Don't introduce per-component reactive state for cross-cutting concerns.
- `app/plugins/` — Nuxt-side bootstrap (i18n locale init from `localStorage`, error-overlay install before world boot).
- `app/assets/css/` — `tokens.css` is the single source of truth for colour / typography / spacing. `base.css` resets + canvas positioning + label/prompt chrome. `responsive.css` handles touch-mode hides + the `touch-action: none` gate. `main.css` imports them all in order.

### Engine side (`engine/`) — unchanged from parent edition, just relocated

- `engine/sketchbook.ts` — bundle entry. Re-exports `Sketchbook.World` + the four sandbox classes + `showTitleScreen` + `installErrorOverlay`.
- `engine/world/World.ts` — central orchestrator (~650 LOC). Holds renderer / physics / scenarios / updatables / lil-gui params / audio listener, plus the per-frame `update` + `render` loops. Heavy setup lives in `engine/world/setup/`.
- `engine/world/setup/` — `bootstrapHTML` (DOM scaffolding — appends canvas to body), `RendererPipeline` (renderer + composer + FXAA + resize + tickRenderPipeline + tickCannonDebug), `ParamsBootstrap` (lil-gui-style params object + persistence — no panel; `DebugPanel.vue` provides that), `MapSwitcher`, `DefaultNPCInjector`, `AnimalInjector`, `BirdInjector`, `ButterflyInjector`.
- `engine/world/loading/SceneLoader.ts` — `loadScene(world, lm, gltf)` walks the GLTF and dispatches by `userData.data` to physics / spawn / scenario / path / ocean / grass / speaker constructors.
- `engine/world/scenarios/` — `Scenario`, `Path`, `PathNode`, `defaultDialogs`.
- `engine/world/spawn/` — `Character/NPC/Vehicle/Shape SpawnPoint` + `ShapeEntity`.
- `engine/world/audio/` — `ProceduralAudio` base + `EngineSound` / `AmbientSound` / `BackgroundMusic` / `Speaker` / `SfxBus` / per-character `CharacterSfx` + `BirdSound` + `AnimalVoices` + `AudioHelpers`.
- `engine/world/animals/` — `WanderingAnimals` + `AnimalBehavior`/`DogBehavior`/`CatBehavior` + `AnimalModels` + `CatBuilder` + `DogBuilder` + `AnimalAnimator` + `AnimalSpawner` + `Birds` + `Butterflies`.
- `engine/world/sandboxes/` — `BaseScene` + `TestScene` + `Test2Scene` + `Test3Scene` + `ExampleScene`.
- `engine/world/ui/WorldLabels.ts` — distance-culling CSS2D name-label registry (engine-side; the rest of UI is Vue).
- `engine/core/` — shared infrastructure: `LoadingManager`, `InputManager`, `CameraOperator`, `CameraShake`, `CommonControls`, `UIManager`, `FunctionLibrary`.
- `engine/characters/` — `Character` + state machine + `CharacterPhysicsBridge` + `CharacterInputBridge` + `character_ai/` behaviours.
- `engine/vehicles/` — `Vehicle` base + `Car`/`Helicopter`/`Airplane`/`Boat`/`RocketShip` + `StuckRecovery` + `VehicleAudioBridge` + `WheelManager`.
- `engine/physics/colliders/` — `BoxCollider`, `SphereCollider`, `CylinderCollider`, `CapsuleCollider`, `TrimeshCollider`.
- `engine/enums/` — `EntityType`, `CollisionGroups`, `SeatType`, `Side`, `Space`, `UpdateOrder`, `RenderLayers`.
- `engine/i18n/index.ts` — engine-side `t(key, vars)` shim. Mirrors `@nuxtjs/i18n`'s lookup over the same JSON tables.
- **`engine/state/index.ts`** — the bridge contract. Engine calls `engineState().group.method(args)`. `EngineHost.vue` calls `bindEngineState(impl)` with closures over composables on mount, and `bindEngineState(STUB)` on unmount.

For deeper pointers see `docs/architecture.md` and `docs/map-authoring.md`.

## Mental model: how a frame happens

1. `World.render()` → request RAF → compute timestep
2. `World.update(timeStep)` runs every registered `IUpdatable.update()` sorted by `updateOrder`. Slots are named in `engine/enums/UpdateOrder.ts` (× 10 spacing): `CharacterPhysics` (10) → `VehiclePhysics` (20) → `Input` (30) → `Camera` (40) → `Environment` (50, Sky/ShapeEntity) → `Scenarios` (60, RaceContent) → `World` (100, Grass/Ocean/WanderingAnimals/Birds/Butterflies) → `Audio` (110) → `Prompts` (130) → `Labels` (140) → `PostCamera` (150, CameraShake).
3. `composer.render()` (FXAA only) or direct `renderer.render()`.
4. `outlineEffect.renderPass()` overlays the depth-Sobel outline if `params.Outlines` is on.
5. `labelRenderer.render()` projects CSS2D name labels above their anchors.

`world.params.Time_Scale` is the throttle. `setTimeScale(0)` pauses physics + state updates entirely (PauseMenu uses this through the lifecycle composable).

## The reactive bridge — the single most important contract

```
engine/state/index.ts           ← interface only, no Vue
    interface EngineStateBridge { ... groups of setters ... }
    let impl: EngineStateBridge = STUB;
    export function engineState(): EngineStateBridge { return impl; }
    export function bindEngineState(next: EngineStateBridge): void { impl = next; }

EngineHost.vue (Vue side)
    onMounted(() => {
        bindEngineState({
            loading:   { setVisible: (v) => loading.visible.value = v, ... },
            scenario:  { setOnMoon: (v) => scenario.onMoon.value = v, ... },
            scenarios: { register: (e) => scenarios.register(e), clear: () => scenarios.clear() },
            ...
        });
    });
    onUnmounted(() => bindEngineState(STUB));
```

Engine never imports vue / `~/composables/`. Vue never reaches into engine privates. When you add cross-cutting state:
1. Method on the interface (and a no-op stub).
2. Closure in the `bindEngineState({...})` call.
3. Reactive backing in a composable.
4. Engine call: `engineState().yourGroup.yourSetter(value)`.

## Map / level authoring

Same as the parent edition — the engine code is unchanged. Bundled level (`build/assets/world.glb`) is the Inthenew default plus the socketControl variants and the four code-built sandboxes. All switchable from the **Map & Scenarios** debug panel; choice persists in `localStorage['sketchbook.map']`.

`loadScene(world, lm, gltf)` (`engine/world/loading/SceneLoader.ts`) walks every node and acts on `userData`. Full reference: `docs/map-authoring.md`.

## Things to NOT do

- Don't add multiplayer / Socket.io / ECS plumbing — explicit non-goal.
- Don't make engine code import from `~/composables/` or `'vue'`. Bridge contract only.
- Don't push to the parent's `master` (the legacy Webpack edition's stable line). Active branch is `feature/nuxt-upgrade`.
- Don't enable SSR (`ssr: false` is mandatory; the engine is browser-only).
- Don't reintroduce per-component state for cross-cutting concerns (pause visibility, scenario list, dialog open, etc.). Use composables.
- Don't pin `body` / `html` to `position: fixed` / `position: absolute` to fight layout bugs — that breaks the CSS2DRenderer's containing-block resolution and mis-anchors NPC name labels. The `#__nuxt { position: fixed }` overlay pattern is fine and intended.
- Don't downgrade Vue / Nuxt / Nuxt UI / `@nuxtjs/i18n` / vueuse versions. The May 2026 baseline locks all four to current LTS.
- Don't edit the parent repo's `src/ts/` from here — that's the legacy Webpack edition. `engine/` (relocated copy) is what you touch.

## Ongoing TODO

- Bring over remaining iErcann/Notblox features (priority: cannon → rapier migration evaluation).
- Optionally evaluate pmndrs/ecctrl or pmndrs/BVHEcctrl as a controller alternative once we move off cannon-es.
- Audit the rest of the modals (Settings, Welcome, ScenarioWelcome, EmptyWorld, WebglWarning, ErrorOverlay) for the same hardcoded `#fff` issue PauseMenu had — if any of them ship in light mode looking blank, switch to overlay tokens.

Everything else listed in the parent README's TODO is shipped.
