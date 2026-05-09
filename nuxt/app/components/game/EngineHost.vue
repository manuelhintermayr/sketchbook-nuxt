<!--
  EngineHost - the bridge between Nuxt and the Sketchbook engine.
  Responsibilities:
    1. Bind the engine's t() / locale stub to vue-i18n's runtime
       (Block 3 deliberately left the engine's i18n unbound - this
       component fills it in once Nuxt has provided $i18n and
       useUserPrefs has surfaced the persisted locale).
    2. Boot a World instance from the user's persisted map choice
       (GLB path or BaseScene subclass).
    3. Hand off to TouchControls so on-screen joystick / buttons
       appear on touch devices.
    4. Tear everything down when the host unmounts (HMR or future
       route change) - calls World.dispose() so the RAF loop, scene
       graph, physics world and audio context are released.

  The "Start" button is placeholder UI for Block 4 only; Block 6
  replaces it with the real TitleScreen.vue (language picker, theme
  toggle, sound toggle, animated cube). Both serve the same purpose:
  produce a user gesture so the browser allows AudioContext autoplay.
-->

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import {
	World,
	Sw01Scene,
	Sw02Scene,
	TestScene,
	Test2Scene,
	Test3Scene,
	Example,
	TouchControls,
} from '~~engine/sketchbook'
import { bindEngineI18n, type Locale } from '~~engine/i18n'
import { bindEngineState, unbindEngineState } from '~~engine/state'

const { locale, map } = useUserPrefs()
const { t, $i18n } = useNuxtApp()
const loading = useLoadingState()
const hud = useHud()
const race = useRaceState()
const scenario = useScenarioState()
const scenarios = useScenarios()
// $i18n is the runtime instance from @nuxtjs/i18n; we read the active
// locale through it so the engine sees whatever vue-i18n thinks is
// active (vs. our preference ref, which can be one tick ahead during a
// switch).
const i18n = $i18n as { t: (key: string, args?: any) => string, locale: { value: string } }

const { world, isStarted } = useEngineHost()

// GLB-backed maps. Paths are public-relative because Block 1 mirrored
// the original `build/assets/*.glb` into `nuxt/public/assets/`.
const GLB_PATHS: { [k: string]: string } =
{
	'inthenew': '/assets/world.glb',
	'sc-v03':   '/assets/world_sc_v03.glb',
	'sc-v04':   '/assets/world_sc_v04.glb',
}

// Code-built sandboxes. Same registry shape as the original index.html.
// `any` because BaseScene subclasses don't share a strict static
// signature (some have createAsync, some don't).
const SCENE_CLASSES: { [k: string]: any } =
{
	'sw-v01':     Sw01Scene,
	'sw-v02':     Sw02Scene,
	'sc-test':    TestScene,
	'sc-test2':   Test2Scene,
	'sc-test3':   Test3Scene,
	'sc-example': Example,
}

onMounted(() =>
{
	bindEngineI18n(
	{
		t: (key, vars) => i18n.t(key, vars ?? {}),
		getLocale: () => i18n.locale.value as Locale,
		setLocale: (loc: Locale) => { locale.value = loc },
		hasStoredLocale: () => locale.value !== null && locale.value !== undefined,
	})

	// State bridge - engine code writes through these setters into the
	// state composables. Block 11+ Vue components read from those same
	// composables. Until then UIManager and a few World/Scenario
	// hand-written paths still update the legacy DOM elements in
	// parallel; the state half is correct already.
	bindEngineState(
	{
		loading:
		{
			setVisible: (v) => { loading.visible.value = v },
			setProgress: (p) => { loading.progress.value = p },
			setMessage: (m) => { loading.message.value = m },
		},
		hud:
		{
			setUiContainer: (v) => { hud.uiContainer.value = v },
			setControlsOverlay: (v) => { hud.controlsOverlay.value = v },
			setFps: (v) => { hud.fps.value = v },
			setDebugStack: (v) => { hud.debugStack.value = v },
			toggleControlsOverlay: () => { hud.controlsOverlay.value = !hud.controlsOverlay.value },
		},
		race:
		{
			setLap: (lap) => { race.lap.value = lap },
		},
		scenario:
		{
			setOnMoon: (v) => { scenario.onMoon.value = v },
			setPlanetMenuOpen: (v) => { scenario.planetMenuOpen.value = v },
			setActiveScenarioId: (id) => { scenario.activeScenarioId.value = id },
		},
		scenarios:
		{
			register: (e) => scenarios.register(e),
			clear: () => scenarios.clear(),
		},
	})
})

async function start(): Promise<void>
{
	if (isStarted.value) return
	isStarted.value = true

	const choice = map.value
	let arg: any
	if (SCENE_CLASSES[choice] !== undefined)
	{
		const Cls = SCENE_CLASSES[choice]
		// Some sandboxes load their own GLBs asynchronously and expose
		// a static factory (Sw02Scene); the rest construct synchronously.
		arg = typeof Cls.createAsync === 'function' ? await Cls.createAsync() : new Cls()
	}
	else
	{
		arg = GLB_PATHS[choice] ?? GLB_PATHS.inthenew
	}

	world.value = new World(arg)

	// Touch controls install themselves into document.body and synth
	// keyboard events. install() is a no-op on desktop browsers
	// (checks ontouchstart + maxTouchPoints).
	TouchControls.install()
	TouchControls.attachWorld(world.value)
}

onUnmounted(() =>
{
	if (world.value !== null)
	{
		world.value.dispose()
		world.value = null
	}
	isStarted.value = false
	unbindEngineState()
})
</script>

<template>
	<div class="engine-host">
		<button
			v-if="!isStarted"
			class="placeholder-start"
			type="button"
			@click="start"
		>
			{{ t('title.prompt') }}
		</button>
		<StatsBox />
		<DebugPanel />
	</div>
</template>

<style scoped>
.engine-host
{
	position: fixed;
	inset: 0;
	pointer-events: none;
}

/* Placeholder start screen - replaced by <TitleScreen /> in Block 6. */
.placeholder-start
{
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(to bottom, #568db5 0%, #ccdde8 100%);
	color: #fff;
	font-family: 'Solway', serif;
	font-size: 1.5rem;
	border: none;
	cursor: pointer;
	z-index: 100;
	pointer-events: auto;
	text-shadow: 1px 1px 1px #000, 0 1px 3px #000;
}

.placeholder-start:hover
{
	filter: brightness(1.05);
}
</style>
