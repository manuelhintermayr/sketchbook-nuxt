// Modal-stack registry + game-mute / pause bridge.
//
// Each blocking modal (PauseMenu, SettingsModal, WelcomeModal,
// WebglWarning, EmptyWorld, ErrorOverlay, DialogBox) registers
// itself by id while open. Engine code reacts to `isAnyOpen`:
//   - World.setTimeScale(0) when the topmost is a hard-pause modal
//   - SfxBus / BackgroundMusic mute while any blocking modal is up
//
// This replaces:
//   - the original PauseMenu.handleKeyDown DOM-querying for swal2
//     containers + dialog-bar.visible + settings-modal.visible
//   - PauseMenu.savedTimeScale snapshot (now a watch on the lifecycle
//     ref handles the bookkeeping centrally)
//
// Each modal calls `register(id)` in its onMounted/onOpen and
// `unregister(id)` on close/onUnmounted. The `useEventListener` of
// vueuse pattern works the same way.

import { ref, computed } from 'vue'

const open = ref<Set<string>>(new Set())

const isAnyOpen = computed(() => open.value.size > 0)
const topMost = computed(() =>
{
	const arr = Array.from(open.value)
	return arr.length === 0 ? null : arr[arr.length - 1]
})

function register(id: string): void
{
	const next = new Set(open.value)
	next.add(id)
	open.value = next
}

function unregister(id: string): void
{
	if (!open.value.has(id)) return
	const next = new Set(open.value)
	next.delete(id)
	open.value = next
}

function isOpen(id: string): boolean
{
	return open.value.has(id)
}

export function useGameLifecycle()
{
	return { isAnyOpen, topMost, register, unregister, isOpen }
}
