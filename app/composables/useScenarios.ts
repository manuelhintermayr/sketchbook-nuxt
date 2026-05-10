// Registry of launchable scenarios.
//
// The engine's Scenario.createLaunchLink() used to add a button to
// lil-gui's Scenarios sub-folder; in the Nuxt port it pushes an entry
// into this composable instead. The DebugPanel renders one
// <DebugButton> per entry, the modal Restart action reads the
// activeScenarioId from useScenarioState (set by World.launchScenario).
//
// Each World construction wipes the registry first - scenarios are
// scene-bound and a re-mount must not see stale entries from the
// previous map.

import { ref, shallowRef } from 'vue'

export interface ScenarioEntry
{
	id: string
	name: string
	launch: () => void
}

const entries = shallowRef<ScenarioEntry[]>([])

function clear(): void
{
	entries.value = []
}

function register(entry: ScenarioEntry): void
{
	// Reuse existing slot if the same id is registered again - happens
	// when a scenario re-launches itself via the restart button.
	const idx = entries.value.findIndex((e) => e.id === entry.id)
	const next = entries.value.slice()
	if (idx >= 0) next[idx] = entry
	else next.push(entry)
	entries.value = next
}

export function useScenarios()
{
	return { entries, register, clear }
}
