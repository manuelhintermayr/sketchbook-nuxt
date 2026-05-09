// Loading-screen lifecycle. Replaces the original engine's
// UIManager.setLoadingProgress + setLoadingScreenVisible (which
// mutated #loading-screen and #loading-bar-fill DOM nodes directly).
//
// Now LoadingManager (engine) writes to these refs and the Vue
// LoadingScreen.vue component (Block 7) reads them.

import { ref } from 'vue'

const visible = ref<boolean>(true)
// Percentage 0-100. Pre-clamped at the consumer so xhr-progress
// glitches can't push past the track width.
const progress = ref<number>(0)
// Override for the localised "Loading world assets..." line - the
// engine sets it once on startup; future scenarios that load extra
// data could set their own message here.
const message = ref<string>('')

export function useLoadingState()
{
	return { visible, progress, message }
}
