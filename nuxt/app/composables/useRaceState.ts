// Race / lap-counter state. Replaces the imperative
// `world.lapCounter.innerHTML = t('world.lap', { n })` + style.visibility
// toggles. RaceContent (engine) writes lap; the LapCounter.vue
// component (Block 7) reads it.

import { ref } from 'vue'

// null = no race active (counter hidden). 0+ = current lap.
const lap = ref<number | null>(null)

export function useRaceState()
{
	return { lap }
}
