// Holds the singleton World instance + boot-state flag.
//
// `shallowRef` because World is a deeply nested graph of THREE / CANNON
// objects with tens of thousands of internal properties - making it
// fully reactive would burn cycles in the per-frame render loop. We only
// need the ref slot to track existence, not deep-watch contents. UI
// components that care about engine *state* read it through the
// dedicated state composables (useLoadingState, useScenarioState, ...)
// added in Block 5.
//
// Singleton pattern (module-level const) because there is exactly one
// World per app session. A second instance would mean two RAF loops,
// two physics worlds, two audio contexts - never wanted.

import { shallowRef } from 'vue'
import type { World } from '~~engine/sketchbook'

const world = shallowRef<World | null>(null)
const isStarted = shallowRef(false)

export function useEngineHost()
{
	return { world, isStarted }
}
