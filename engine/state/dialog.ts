// Branching NPC dialog state.
//
// Same singleton pattern as engine/state/params.ts: the reactive
// state lives here, the Vue composable (composables/useDialog) just
// re-exports for the UI layer. Engine code (ProximityPrompt,
// defaultDialogs, NPCSpawnPoint) imports types + open/close from
// here directly.
//
// Replaces engine/world/ui/DialogBox.ts (deleted in Block 15). The
// DOM bar + typewriter + choice rendering moved to DialogBox.vue.

import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import type { Character } from '../characters/Character'

export interface DialogChoice
{
	label: string
	next: string | 'end'
}

export interface DialogNode
{
	speaker: string
	role?: string
	portrait?: string
	text: string
	choices: DialogChoice[]
}

export interface Dialog
{
	start: string
	nodes: { [id: string]: DialogNode }
}

export interface DialogOpenOptions
{
	participants?: Character[]
	onClose?: () => void
}

export const dialog = shallowRef<Dialog | null>(null)
export const currentNodeId = ref<string | null>(null)
export const isOpen = ref<boolean>(false)
export const participants = shallowRef<Character[]>([])

const onCloseHandler = shallowRef<(() => void) | null>(null)

// SfxBus reference - set by World on construction so we can fire the
// dialog whoosh without coupling this module to the engine root.
type SfxBusLike = { playDialogOpen: () => void }
let sfxBus: SfxBusLike | null = null

export function bindDialogSfxBus(bus: SfxBusLike | null): void
{
	sfxBus = bus
}

export function openDialog(d: Dialog, options?: DialogOpenOptions): void
{
	dialog.value = d
	currentNodeId.value = d.start
	participants.value = options?.participants ?? []
	onCloseHandler.value = options?.onClose ?? null
	isOpen.value = true

	// Legacy CustomEvent bus - TouchControls.ts (Block 17 will replace
	// it) listens for `dialog-change` to hide its on-screen buttons
	// while a conversation is up. Kept until that block lands.
	if (typeof window !== 'undefined')
	{
		window.dispatchEvent(new CustomEvent('dialog-change', { detail: { open: true } }))
	}

	// Whoosh-in cue.
	sfxBus?.playDialogOpen()

	// Freeze each participant - both player and NPC stop moving and
	// drop their actions for the duration. resetControls() routes
	// through triggerAction() so state machines transition out of
	// Walk / Run cleanly.
	for (const p of participants.value)
	{
		p.dialogFreeze = true
		p.resetControls()
	}

	// Face the player. participants[0] is the player (set by
	// ProximityPrompt); every NPC after them rotates so the
	// conversation reads as two characters facing each other.
	if (participants.value.length >= 2)
	{
		const player = participants.value[0]
		for (let i = 1; i < participants.value.length; i++)
		{
			const npc = participants.value[i]
			const dx = player.position.x - npc.position.x
			const dz = player.position.z - npc.position.z
			if (dx === 0 && dz === 0) continue
			npc.setOrientation(new THREE.Vector3(dx, 0, dz))
		}
	}
}

export function closeDialog(): void
{
	if (!isOpen.value) return
	isOpen.value = false
	dialog.value = null
	currentNodeId.value = null
	const onClose = onCloseHandler.value
	onCloseHandler.value = null
	for (const p of participants.value) p.dialogFreeze = false
	participants.value = []
	if (typeof window !== 'undefined')
	{
		window.dispatchEvent(new CustomEvent('dialog-change', { detail: { open: false } }))
	}
	onClose?.()
}

export function pickChoice(index: number): void
{
	if (dialog.value === null || currentNodeId.value === null) return
	const node = dialog.value.nodes[currentNodeId.value]
	if (node === undefined) return
	const choice = node.choices[index]
	if (choice === undefined) return
	if (choice.next === 'end') closeDialog()
	else currentNodeId.value = choice.next
}
