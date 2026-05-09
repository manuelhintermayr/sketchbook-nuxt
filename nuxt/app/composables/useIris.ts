// Iris-wipe transition API. Replaces the IrisTransition singleton
// (engine/world/ui/IrisTransition.ts) that imperatively appended a
// div to body and managed clip-path animation.
//
// IrisTransition.vue (Block 7) renders the clip-path overlay; this
// composable exposes the open/close promise API engine code (and the
// pause-menu Reload button) call into.

import { ref } from 'vue'

const TRANSITION_MS = 700

const visible = ref<boolean>(false)

// Promise-based API mirrors the original singleton so engine code
// (RestartScenario, Reload-page, language-switch reload) can chain a
// scene swap behind the cover before opening it again.
async function close(): Promise<void>
{
	visible.value = true
	await new Promise<void>((resolve) => setTimeout(resolve, TRANSITION_MS))
}

async function open(): Promise<void>
{
	visible.value = false
	await new Promise<void>((resolve) => setTimeout(resolve, TRANSITION_MS))
}

export function useIris()
{
	return { visible, close, open }
}
