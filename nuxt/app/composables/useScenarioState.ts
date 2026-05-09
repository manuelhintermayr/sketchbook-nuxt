// Scenario / planet state. Replaces:
//   - World.onMoon: boolean flag (still on World too because the
//     physics step reads it 60Hz - kept in sync via watch())
//   - the planet-menu DOM toggling: classList.add/remove('planet-menu-hidden')
//   - lastScenarioID tracking for the pause-menu's Restart button
//
// PlanetMenu.vue (Block 7) reads `planetMenuOpen`. RocketShip + World
// write `onMoon` and `planetMenuOpen`.

import { ref } from 'vue'

const onMoon = ref<boolean>(false)
const planetMenuOpen = ref<boolean>(false)
// Last launched scenario id - drives the pause-menu Restart action.
const activeScenarioId = ref<string | null>(null)

export function useScenarioState()
{
	return { onMoon, planetMenuOpen, activeScenarioId }
}
