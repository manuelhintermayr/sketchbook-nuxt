// Iris-wipe transition state. Same singleton pattern as
// engine/state/{dialog, params}: reactive ref + sync functions live
// here, the composable in composables/useIris.ts re-exports for the
// UI layer.
//
// IrisTransition.vue (Block 11) reads `visible` and renders the
// clip-path overlay. Engine code (World.restartScenario) and the
// SettingsModal Reset / language-switch reload + DebugPanel map
// switch all call closeIris() before location.reload() to cover the
// flash.

import { ref } from 'vue'

const TRANSITION_MS = 700

export const visible = ref<boolean>(false)

export async function closeIris(): Promise<void>
{
	visible.value = true
	await new Promise<void>((resolve) => setTimeout(resolve, TRANSITION_MS))
}

export async function openIris(): Promise<void>
{
	visible.value = false
	await new Promise<void>((resolve) => setTimeout(resolve, TRANSITION_MS))
}
