# UI system (Nuxt edition)

The UI rebuild that came with the Nuxt port replaced every `document.createElement`-driven overlay from the upstream Webpack edition with a Vue 3 SFC. Tokens carry over verbatim. This doc is the catalogue.

## Design tokens (`app/assets/css/tokens.css`)

Every other module references CSS custom properties from here. Drop a `class="dark"` on `<html>` to flip the surface palette to dark mode (the `[data-theme="sketchbook"].dark` block at the bottom of the file overrides surface / on-surface / outline).

Highlights:

- **Brand:** `--color-primary` (gold `#FFB900`) + `--color-primary-shadow` for the signature 4px press effect; `--color-tertiary` (blue `#568db5`) for accents and the "me" name tag.
- **Surfaces:** five-step neutral scale (`--color-surface`, `…dim`, `…container`, `…container-high`, `…container-highest`) so cards stack visually.
- **Themed overlay tokens:** `--color-overlay-bg`, `--color-overlay-text`, `--color-overlay-text-soft`, `--color-overlay-choice-bg`, `--color-overlay-choice-border`, `--color-overlay-choice-bg-hover`. These are theme-aware (cream + black text in light, near-black + white text in dark) and are the right thing to reach for in any modal — never hardcode `#fff` or `rgba(255,255,255,…)` inside a card surface.
- **Typography:** `--font-headline` / `--font-body` (Solway), `--font-label` (Catamaran), `--font-mono` (Cutive Mono), `--font-display-alt` (Alfa Slab One). Ten-step size scale (`--text-display` … `--text-overline`).
- **Spacing:** `--space-1` (0.25rem) … `--space-20` (5rem).
- **Shadows:** `--shadow-gold` (the 4px press shadow), `--shadow-keycap` (multi-layer inset for `.ctrl-key`), `--text-shadow-overlay` (1px+3px black drop for readable text **over the 3D scene**, not on card surfaces).
- **z-index ordering:** `--z-dropdown` (10) … `--z-stats` (10000). Use these instead of arbitrary numbers — collisions are easy to introduce otherwise.

If you add a new overlay, declare its z-index from this scale and pull all colour / size / motion constants through `var(--…)`.

## Stack contract (the four direct body siblings)

The engine appends three direct `<body>` children that are NOT inside `#__nuxt`: `<canvas id="canvas">`, `<div id="labelRenderer">`, and one `<div class="proximity-prompt">` per active prompt. `base.css` gives them an explicit z-stack:

```
0  -  #canvas              (WebGL renderer, picks up mousedown / mousemove)
1  -  #labelRenderer + .proximity-prompt
2  -  #__nuxt              (Vue UI overlay, position: fixed, pointer-events: none)
```

Every Vue component is rendered inside `#__nuxt` (or teleported into `body` via `<UApp>`'s teleport target — but those teleports inherit the `pointer-events` scheme through their own scoped CSS). Mouse events still reach the canvas because `__nuxt` is `pointer-events: none` and every interactive Vue component re-enables `pointer-events: auto` on its own root.

## Overlay catalogue

```
                                 z-index           triggered by
                                 ───────           ──────────────────
TitleScreen        --z-modal     (40)              EngineHost.vue v-if !isStarted
LoadingScreen      0             (always at back)  useLoadingState; shown until LoadingManager finishes
PlanetMenu         --z-modal     (40)              RocketShip apogee → engineState().scenario.setPlanetMenuOpen(true)
DialogBox          --z-overlay   (30)              ProximityPrompt with dialog → engineState().dialog.open(...)
PauseMenu          --z-modal     (40)              Esc (after pause.setEnabled(true))
SettingsModal      --z-modal     (40)              PauseMenu → Settings
WelcomeModal       --z-modal     (40)              engineState().startupModals.showWelcome()
ScenarioWelcome    --z-modal     (40)              engineState().startupModals.showScenarioWelcome(title, body)
EmptyWorld         --z-modal     (40)              engineState().startupModals.showEmpty()
WebglWarning       --z-modal     (40)              engineState().startupModals.showWebglWarning()
ErrorOverlay       --z-toast     (50)              window.onerror, unhandledrejection
NameLabel          (CSS2D pass)                    attachNameLabel(target, name, isMe)
StatsBox           --z-stats     (10000)           stats.js dom appended by World; visible via useHud().fps
DebugPanel         --z-overlay   (30)              Always visible on desktop (hidden on touch via responsive.css)
TouchControls      --z-overlay   (30)              First real touch flips useTouchMode().active
```

### TitleScreen (`app/components/title/TitleScreen.vue`)

Pre-game card with bouncing cube + version label + "click or press any key to start". Lives at `--z-modal`. Visible by default; emits `dismiss` on first user gesture (any key down OR a click outside the controls row). The emit also unblocks browser audio autoplay (Speaker depends on this).

A language picker (en / de / es) sits at the bottom of the card, plus two icon buttons in the top-right — dark-mode toggle and sound-mute toggle. Both bind to `useUserPrefs()` (locale, darkMode, soundMuted), which writes through `localStorage`.

Click flow contract: `.title-screen` has `pointer-events: auto` (overrides the `__nuxt` overlay's `pointer-events: none`); the root has `@click="onBackdropClick"`; `.title-screen__controls` has `@click.stop`. Single-source bubble model — any click that doesn't originate inside the controls row dismisses. `composedPath()` walks the actual delivery chain so slotted content inside `LanguagePicker` / `IconButton` is recognised.

### LoadingScreen + progress (`app/components/hud/LoadingScreen.vue`)

Driven by `useLoadingState()` (`visible`, `progress`, `message`). The engine fills these via `engineState().loading.setProgress(p)`, called by `LoadingManager` on every `xhr.progress` and on each `doneLoading()`. Width animates via `transition: width var(--motion-fast)`.

### PlanetMenu (`app/components/hud/PlanetMenu.vue`)

Earth/Moon picker that opens at the rocketship's apogee. `useScenarioState()` exposes `planetMenuOpen` + `setPlanetSelect(handler)`. RocketShip registers the `flyTo(target)` handler via the bridge on enter; PlanetMenu invokes it on user pick.

### DialogBox (`app/components/dialog/DialogBox.vue`, `app/composables/useDialog.ts`, `app/composables/useDialogTypewriter.ts`)

Singleton bottom-anchored card. Schema:

```ts
interface Dialog {
    start: string;
    nodes: { [id: string]: DialogNode };
}

interface DialogNode {
    speaker: string;
    role?: string;
    portrait?: string;     // single character; defaults to first letter of speaker
    text: string;
    choices: DialogChoice[];
}

interface DialogChoice {
    label: string;
    next: string | 'end';
}
```

Mouse + 1–9 keys pick a choice. Players exit only by picking a closing choice (every dialog has one that routes to `'end'`); Esc + walk-away are intentionally non-dismissing so the typewriter can't be yanked mid-sentence.

The typewriter is its own composable so the same logic can be reused (testable, no DOM coupling). `useDialog()` exposes `dialog`, `currentNodeId`, `isOpen`, `pickChoice(num)`. `useDialogTypewriter(text)` returns `{ visible, isTyping, finish }`.

Default NPC dialogs live in `engine/world/scenarios/defaultDialogs.ts`. The dialog tree is cached by locale, so successive scenario launches in the same language reuse the previous build.

### PauseMenu (`app/components/modals/PauseMenu.vue`, `app/composables/usePauseMenu.ts`)

Esc-driven full-screen overlay rendered through `BaseModal`. Disabled (`enabled.value === false`) until `engineState().pause.setEnabled(true)` fires from `LoadingManager.onFinishedCallback` — that prevents Esc from opening pause over the loader.

Single-responsibility split:
- `PauseMenu`'s document-level keydown listener only **opens** the menu (gated on `e.defaultPrevented` so an open BaseModal absorbs the keystroke first).
- `BaseModal`'s document-level keydown listener handles **closing** any open modal — and calls `e.preventDefault()` before emitting `close`, so PauseMenu's listener (which runs second) sees `defaultPrevented` and bails out.

When opened: saves `world.timeScaleTarget` to `savedTimeScale`, calls `world.setTimeScale(0)` through the lifecycle composable, exits pointer lock, focuses the first button.

Buttons:
- **Resume** → `pause.close()`.
- **Settings** → `pause.fireSettings()` — handler set by `World` opens `SettingsModal`.
- **Restart Scenario** → `pause.fireRestart()` — handler set by `World` re-launches `lastScenarioID`.
- **Reload Page** → iris-wipe + `location.reload()`.

All text uses theme-aware overlay tokens (`--color-overlay-text`, `--color-overlay-choice-bg`, etc.) so the menu reads correctly in both light and dark mode.

### SettingsModal (`app/components/modals/SettingsModal.vue`)

Four cards — General / Graphics / Audio / Controls — plus a Low / High quality preset shortcut row at the top of the Graphics card. The General card carries the language picker (en / de / es), Dark mode toggle, and a Reset settings button (wipes every persisted `sketchbook.*` localStorage key + reload). Every other control writes to `world.params[X]` through `useEngineParams()` so every existing lil-gui-style `onChange` handler (CSM enable, mouse-sensitivity push to CameraOperator, etc.) fires automatically.

Audio: `Master_Audio` is a master mute switch — when off, every audio source (continuous synths via `getMasterVolume`, 3D-positional sources via `World.applyAudioListenerVolume`) goes silent regardless of the sub-toggles. Sub-toggles for `Sound_Effects` and `Background_Music` grey out visually while master is off. `Master_Volume` calls `world.setMasterVolume(v)` directly; `Music_Volume` is wired into BackgroundMusic's `perBusGain`.

A `gui.onChange` listener mirrors any DebugPanel change back into the open modal so both views stay in sync. `gui.save()` runs on every modal write so toggle clicks persist immediately.

### ErrorOverlay (`app/components/modals/ErrorOverlay.vue`, `app/composables/useErrorOverlay.ts`)

`installErrorOverlay()` (called from `app/plugins/error-overlay.ts` before world boot) registers `window.onerror` and `window.onunhandledrejection`. The first error to fire shows the overlay; subsequent errors are swallowed (a cascade drowns out the useful first one). The card has:

- error code (e.g. `RUNTIME ERROR`, `UNHANDLED PROMISE`)
- title (the message)
- stack trace (in a `<pre>` block, scrollable)
- **Reload** — `location.reload()`
- **Copy details** — clipboard API with textarea fallback for older browsers

Installed *before* `Sketchbook.World()` is constructed so even bootstrap failures get the friendly card.

### Welcome / Empty / WebglWarning / ScenarioWelcome modals

Each is a thin `BaseModal` wrapper in `app/components/modals/`. The engine drives them through `engineState().startupModals.showX()` — each `show*` method on the bridge resolves to the matching composable's `open()` which returns a `Promise<void>` that resolves when the user dismisses the modal. `useStartupModals()` is the central composable that owns the four modal states.

### NameLabel + WorldLabels (engine-side)

`attachNameLabel(target, name, isPlayer)` (in `engine/world/ui/NameLabel.ts`) creates a `<div class="name-label">` (or `.name-label.me` for the player), wraps it in a `CSS2DObject` anchored at `(0, 1.2, 0)` relative to the target, and adds it as a child. The label follows the target's world transform automatically.

Rendered each frame by `world.labelRenderer.render(graphicsWorld, camera)`. Distance culling and feature-flag gating run through `WorldLabels` (`engine/world/ui/WorldLabels.ts`), the registry on top of the CSS2D pass.

`CharacterSpawnPoint` calls this with `'Du' / 'You' / 'Tú'` + `isPlayer=true` after `takeControl()`. `NPCSpawnPoint` calls it with `userData.name` (or `NPC #N` fallback).

The CSS chrome of `.name-label` lives in `app/assets/css/base.css` (it's a body-level overlay produced by the engine, so it doesn't belong to a specific Vue component).

### DebugPanel (`app/components/debug/DebugPanel.vue` + `DebugFolder` / `DebugSlider` / `DebugToggle` / `DebugSelect` / `DebugButton`)

Vue port of the lil-gui control surface from the upstream Webpack edition. `useEngineParams()` exposes the engine's `params` object as a reactive proxy; each control binds to a specific key with `v-model`. The same `gui.controllersRecursive()` cache `SettingsModal` uses also feeds DebugPanel — so changes from either surface fire the original `onChange` handlers.

Hidden on touch devices via the `html.touch-active` rule in `responsive.css`. Hidden on `pointer: coarse` viewports too.

### TouchControls (`app/components/touch/TouchControls.vue`, `app/composables/useTouchMode.ts`)

On-screen joystick + context-aware button cluster. Auto-mounts inside `EngineHost` regardless of device; visibility is gated by `.touch-controls--active` (driven by `useTouchMode().active`). Activated on the first real touch pointerdown, deactivated by any hardware-key press.

The joystick visual appears at the touch point (slot 0 = movement). The second finger (slot 1) is camera drag. Tap on any finger = jump (in foot mode). The component synthesises native KeyboardEvent / MouseEvent so the engine InputManager handles WASD + Space + Shift like a hardware keyboard.

`html.touch-active` triggers `responsive.css` to hide the keyboard overlay + DebugPanel, and to set `touch-action: none; overscroll-behavior: none` on `html / body / #__nuxt / #canvas` so vertical drags don't fire `pointercancel` mid-stroke.

### IrisTransition (`app/components/hud/IrisTransition.vue`, `app/composables/useIris.ts`)

Singleton CSS clip-path circle. `useIris().close()` returns a `Promise<void>` that resolves when the iris finishes closing (700 ms). Used by:
- Pause menu's "Reload Page" button.
- Map switcher (close → write localStorage → reload; on next boot the iris opens after the loader is done).
- Scenario restart.

### GithubCorner / ControlsOverlay / LapCounter

Static HUD pieces under `app/components/hud/`. GithubCorner is a 120 × 120 clip box with the SVG rotated −45° (the original visual trick). ControlsOverlay reads its rows from `useControls()` — engine code calls `engineState().controls.setRows(rows)` to update. LapCounter binds to `useRaceState().lap`.

## Adding a new overlay

1. **Pick or create a composable** in `app/composables/`. If the overlay needs cross-cutting state (visible flag, content data), declare a module-level reactive ref and re-export through `useYourOverlay()`. If it's purely one component's local state, use refs inside `<script setup>` and skip this step.
2. **Create the SFC** in `app/components/<area>/YourOverlay.vue`. Use scoped CSS, pull every constant from `tokens.css` via `var(--…)`, declare its z-index from the scale.
3. **If it's themed** (rendered on a card surface), use the overlay tokens (`--color-overlay-bg`, `--color-overlay-text`, `--color-overlay-choice-*`) — never hardcode colours.
4. **If it's a modal**, wrap it in `<BaseModal>` so it gets the standard chrome + Esc-to-close + game-pause integration via `useGameLifecycle`.
5. **If the engine triggers it**, add a method to `EngineStateBridge` in `engine/state/index.ts`, wire the closure in `EngineHost.vue`'s `bindEngineState({...})` call.
6. **If it's keyboard-driven**, register the listener via plain `document.addEventListener('keydown', handler)` in `onMounted` + remove in `onBeforeUnmount`. The `useEventListener(window, 'keydown', ...)` form from vueuse has a reachability gap — see commit `b822a88`.
7. **If it has i18n strings**, add the keys to `i18n/locales/en.json` (+ `de.json`, `es.json`).
8. **If it lives in the touch HUD**, add the visibility gate behind `useTouchMode().active`.

## Theming

Every visual constant is a token. To add a theme:

```css
[data-theme="sketchbook"].my-theme
{
    --color-primary: #ff4081;
    --color-on-primary: #ffffff;
    /* … */
}
```

Then `document.documentElement.classList.add('my-theme')`.

The `dark` class is the only non-default theme shipped. `useUserPrefs().darkMode` is the persistent toggle; the TitleScreen + Settings modal both bind to it.

## Cheatsheet: which composable owns what

| Composable | Owns | Read by | Written by |
|---|---|---|---|
| `useUserPrefs` | locale, darkMode, soundMuted | TitleScreen, SettingsModal, i18n bootstrap | TitleScreen toggles, SettingsModal toggles |
| `useEngineParams` | reactive proxy over engine's `params` object | DebugPanel, SettingsModal | Either UI surface; engine's `gui.onChange` mirrors |
| `useGameLifecycle` | which modals are open; pauses engine when ≥1 is open | BaseModal mounts | BaseModal's `register` / `unregister` |
| `useScenarios` | scenario list (id, label, defaultFlag) | Map switcher dropdown in DebugPanel | engine via `engineState().scenarios.register` |
| `useScenarioState` | onMoon, planetMenuOpen, activeScenarioId, planet-select handler | PlanetMenu, scenario UI | engine via `engineState().scenario.*` |
| `usePauseMenu` | visible, enabled, restart/settings handlers | PauseMenu, BaseModal Esc gate | engine via `engineState().pause.*`; user via Esc / button clicks |
| `useStartupModals` | welcome / empty / webgl / scenarioWelcome state | The four modal SFCs | engine via `engineState().startupModals.show*` |
| `useDialog` | dialog object, currentNodeId, isOpen, pickChoice | DialogBox | engine via `engineState().dialog.open(dialog)` |
| `useProximity` | nearInteractCount, nearDialogCount | TouchControls (button visibility) | engine ProximityPrompt enter/leave events |
| `useHud` | uiContainer + controlsOverlay + fps + debugStack refs | EngineHost (passes to engine) | engine via `engineState().hud.*` |
| `useIris` | iris-wipe state, returns promises | PauseMenu reload, map switcher, restart | components calling `iris.open()` / `iris.close()` |
| `useLoadingState` | visible, progress, message | LoadingScreen | engine via `engineState().loading.*` |
| `useRaceState` | lap counter | LapCounter | engine via `engineState().race.setLap` |
| `useTouchMode` | active flag (toggles `html.touch-active`) | TouchControls visibility, responsive.css | TouchControls' first pointerdown |
| `useEngineHost` | shared world ref | TouchControls (world.characters lookups) | EngineHost on world construct |
| `useErrorOverlay` | error overlay state | ErrorOverlay | `installErrorOverlay()` plugin |
| `useControls` | controls-overlay row data | ControlsOverlay | engine via `engineState().controls.setRows` |
