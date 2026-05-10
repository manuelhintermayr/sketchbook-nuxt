// Control-overlay rows.
//
// Engine code (Character / Vehicle states) calls `world.updateControls`
// with an array of { keys, desc }; in the Nuxt port that array lands
// here through the engine state bridge, and ControlsOverlay.vue
// renders one row per entry with KeyCap atoms.

import { ref } from 'vue'

export interface ControlRow
{
	keys: string[]
	desc: string
}

const rows = ref<ControlRow[]>([])

function set(next: ControlRow[]): void
{
	rows.value = next
}

function clear(): void
{
	rows.value = []
}

export function useControls()
{
	return { rows, set, clear }
}
