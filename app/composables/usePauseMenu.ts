// Pause menu state.
//
// Replaces the imperative open / close / setSettingsHandler API of
// engine/world/ui/PauseMenu.ts. The Vue PauseMenu.vue (Block 13)
// reads visible + enabled, fires actions through onResume / onRestart
// / onReload. The Settings button calls onSettings, which Block 14
// will hand off to SettingsModal.

import { ref, shallowRef } from 'vue'

const visible = ref<boolean>(false)
// Disabled until LoadingManager.onFinishedCallback fires - matches
// the original engine semantics so the menu can't open over the
// welcome dialog.
const enabled = ref<boolean>(false)

const restartHandler = shallowRef<(() => void) | null>(null)
const settingsHandler = shallowRef<(() => void) | null>(null)

function setEnabled(v: boolean): void
{
	enabled.value = v
	if (!v) visible.value = false
}

function setRestartHandler(h: (() => void) | null): void
{
	restartHandler.value = h
}

function setSettingsHandler(h: (() => void) | null): void
{
	settingsHandler.value = h
}

function open(): void
{
	if (!enabled.value || visible.value) return
	visible.value = true
}

function close(): void
{
	if (!visible.value) return
	visible.value = false
}

function toggle(): void
{
	if (visible.value) close()
	else open()
}

function fireRestart(): void
{
	restartHandler.value?.()
}

function fireSettings(): void
{
	settingsHandler.value?.()
}

export function usePauseMenu()
{
	return {
		visible,
		enabled,
		setEnabled,
		setRestartHandler,
		setSettingsHandler,
		open,
		close,
		toggle,
		fireRestart,
		fireSettings,
	}
}
