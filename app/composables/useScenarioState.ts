// Scenario / planet state. Replaces:
//   - World.onMoon: boolean flag (still on World too because the
//     physics step reads it 60Hz - kept in sync via watch())
//   - the planet-menu DOM toggling: classList.add/remove('planet-menu-hidden')
//   - lastScenarioID tracking for the pause-menu's Restart button
//
// PlanetMenu.vue (Block 11) reads `planetMenuOpen` + calls
// `selectPlanet`; RocketShip registers a handler via setPlanetSelect
// so the menu's click flows back into the engine without DOM coupling.

import { ref, shallowRef } from 'vue'

const onMoon = ref<boolean>(false)
const planetMenuOpen = ref<boolean>(false)
const activeScenarioId = ref<string | null>(null)

type PlanetTarget = 'earth' | 'moon'
const planetSelectHandler = shallowRef<((t: PlanetTarget) => void) | null>(null)

function setPlanetSelect(handler: ((t: PlanetTarget) => void) | null): void
{
	planetSelectHandler.value = handler
}

function selectPlanet(target: PlanetTarget): void
{
	planetSelectHandler.value?.(target)
}

export function useScenarioState()
{
	return { onMoon, planetMenuOpen, activeScenarioId, setPlanetSelect, selectPlanet }
}
