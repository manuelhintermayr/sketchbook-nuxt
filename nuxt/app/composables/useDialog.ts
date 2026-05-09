// NPC dialog API + reactive state. Replaces:
//   - DialogBox singleton class (open/close imperative on global instance)
//   - window.dispatchEvent(new CustomEvent('dialog-change')) -
//     consumed today by TouchControls + (after Block 12) by
//     useGameLifecycle's modal stack
//
// Engine code (NPC ProximityPrompt onInteract) calls open(dialog,
// participants); the DialogBox.vue component (Block 8) reads the
// reactive state and renders the bar with typewriter + choices.

import { ref, shallowRef } from 'vue'
import type { Character } from '~~engine/characters/Character'

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

// shallowRef for the dialog object so a deeply-nested choice tree
// doesn't trigger a tracker proxy on every node access. Same for the
// Character[] participants - they hold mesh / physics-body refs we
// don't want Vue to traverse.
const dialog = shallowRef<Dialog | null>(null)
const currentNodeId = ref<string | null>(null)
const participants = shallowRef<Character[]>([])
const isOpen = ref<boolean>(false)
const onCloseHandler = shallowRef<(() => void) | null>(null)

export interface DialogOpenOptions
{
	participants?: Character[]
	onClose?: () => void
}

function open(d: Dialog, options?: DialogOpenOptions): void
{
	dialog.value = d
	currentNodeId.value = d.start
	participants.value = options?.participants ?? []
	onCloseHandler.value = options?.onClose ?? null
	isOpen.value = true
}

function close(): void
{
	isOpen.value = false
	dialog.value = null
	currentNodeId.value = null
	const onClose = onCloseHandler.value
	onCloseHandler.value = null
	participants.value = []
	onClose?.()
}

function pickChoice(index: number): void
{
	if (dialog.value === null || currentNodeId.value === null) return
	const node = dialog.value.nodes[currentNodeId.value]
	if (node === undefined) return
	const choice = node.choices[index]
	if (choice === undefined) return
	if (choice.next === 'end') close()
	else currentNodeId.value = choice.next
}

export function useDialog()
{
	return { dialog, currentNodeId, participants, isOpen, open, close, pickChoice }
}
