// Bridge between engine code and the Nuxt state composables.
//
// During the migration, every UIManager.setX call mirrors into BOTH
// the legacy DOM elements (created by HTMLBootstrap) AND the matching
// state composable (consumed by Block 11+ Vue components). Once the
// Vue components fully take over (LoadingScreen.vue, StatsBox.vue,
// ControlsOverlay.vue, etc.), the DOM-mutation half can be deleted
// in one move.
//
// The DOM half stays guarded by null-checks - if a future EngineHost
// build path skips the bootstrap (e.g. because Vue components mount
// the same elements themselves), the legacy mutations turn into no-ops
// instead of crashing on null dereferences.

import { engineState } from '../state'

export class UIManager
{
	public static setUserInterfaceVisible(value: boolean): void
	{
		engineState().hud.setUiContainer(value)

		const el = document.getElementById('ui-container')
		if (el !== null) el.style.display = value ? 'block' : 'none'
	}

	public static setLoadingScreenVisible(value: boolean): void
	{
		engineState().loading.setVisible(value)

		const el = document.getElementById('loading-screen')
		if (el !== null) el.style.display = value ? 'flex' : 'none'
	}

	public static setFPSVisible(value: boolean): void
	{
		engineState().hud.setFps(value)

		const stats = document.getElementById('statsBox')
		if (stats !== null) stats.style.display = value ? 'block' : 'none'
		const gui = document.getElementById('dat-gui-container')
		if (gui !== null) gui.style.top = value ? '48px' : '0px'
	}

	// LoadingManager calls this on each progress tick. Both the
	// percent label and the bar fill are updated; the value clamps to
	// [0, 100] so a flaky xhr-progress doesn't push past the track.
	public static setLoadingProgress(percent: number): void
	{
		const v = Math.max(0, Math.min(100, percent))
		engineState().loading.setProgress(v)

		const label = document.getElementById('loading-percent')
		const fill = document.getElementById('loading-bar-fill')
		if (label !== null) label.textContent = Math.floor(v) + '%'
		if (fill !== null) fill.style.width = v + '%'
	}
}
