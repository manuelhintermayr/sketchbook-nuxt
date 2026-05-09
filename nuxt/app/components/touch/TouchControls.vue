<!--
  TouchControls - on-screen joystick + context-aware button cluster.
  Replaces engine/core/TouchControls.ts (685 LOC). Auto-mounts
  inside EngineHost regardless of device; the html.touch-active
  class (driven by useTouchMode) hides everything by default and
  flips visible only on a real touch pointerdown. CSS handles the
  visibility so a desktop / hybrid device shows the keyboard HUD
  and a phone shows the touch HUD without any framework branching.

  Synthesises native KeyboardEvent + MouseEvent so the existing
  engine InputManager handles WASD + Space + Shift like a hardware
  keyboard. The engine never knows touch events exist.
-->

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEventListener } from '@vueuse/core'

const JOYSTICK_RADIUS = 70
const JOYSTICK_DEADZONE = 0.2
const SPRINT_AUTO_THRESHOLD = 0.85
const TAP_MAX_MOVE = 10
const TAP_MAX_TIME = 500
const TOUCH_CAM_SENSITIVITY = 2.5
const NEAR_VEHICLE_DISTANCE = 10

const KEYBOARD_DEACTIVATE_KEYS = new Set([
	'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyF', 'KeyV', 'KeyX', 'KeyQ', 'KeyR',
	'Space', 'ShiftLeft', 'Escape',
])

type DirectionKey = 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD'
type FingerRole = 'joystick' | 'camera'
type TouchMode = 'foot' | 'car' | 'boat' | 'aircraft' | 'rocket' | 'passenger' | 'dialog'

interface FingerSlot
{
	pointerId: number
	role: FingerRole
	startX: number
	startY: number
	startTime: number
	currentX: number
	currentY: number
}

const { t } = useI18n()
const touchMode = useTouchMode()
const { world } = useEngineHost()
const { isOpen: isDialogOpen } = useDialog()
const { nearInteractCount, nearDialogCount } = useProximity()

// Reactive UI state
const joystickActive = ref<boolean>(false)
const joystickPos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const joystickThumb = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const mode = ref<TouchMode>('foot')
const nearVehicle = ref<boolean>(false)

// Persistent finger / direction state - not reactive to avoid
// re-render churn on every pointermove.
const fingers: (FingerSlot | null)[] = [null, null]
const heldDirections: Set<DirectionKey> = new Set()
let sprintAuto = false

// --- Helpers ---------------------------------------------------------

const dispatchKey = (code: string, pressed: boolean): void =>
{
	document.dispatchEvent(new KeyboardEvent(pressed ? 'keydown' : 'keyup', { code }))
}

const dispatchMouseMove = (deltaX: number, deltaY: number): void =>
{
	const canvas = document.getElementById('canvas')
	if (canvas === null) return
	canvas.dispatchEvent(new MouseEvent('mousedown'))
	canvas.dispatchEvent(new MouseEvent('mousemove', { movementX: deltaX, movementY: deltaY }))
	canvas.dispatchEvent(new MouseEvent('mouseup'))
}

const setDirection = (code: DirectionKey, want: boolean): void =>
{
	const has = heldDirections.has(code)
	if (want && !has) { heldDirections.add(code); dispatchKey(code, true) }
	else if (!want && has) { heldDirections.delete(code); dispatchKey(code, false) }
}

const releaseAllDirections = (): void =>
{
	for (const code of heldDirections) dispatchKey(code, false)
	heldDirections.clear()
}

const releaseSprintAuto = (): void =>
{
	if (sprintAuto) { dispatchKey('ShiftLeft', false); sprintAuto = false }
}

// --- World polling --------------------------------------------------

let rafId: number | null = null
const tick = (): void =>
{
	pollWorldState()
	rafId = requestAnimationFrame(tick)
}

const pollWorldState = (): void =>
{
	const w = world.value
	if (w === null) return
	const player = w.characters.find((c: any) => c.isPlayer)
	if (player === undefined) return

	let nextMode: TouchMode
	if (isDialogOpen.value) nextMode = 'dialog'
	else if (player.controlledObject !== undefined)
	{
		const et = (player.controlledObject as any).entityType
		nextMode = et === 'car' ? 'car'
			: et === 'boat' ? 'boat'
			: (et === 'helicopter' || et === 'airplane') ? 'aircraft'
			: et === 'rocketship' ? 'rocket'
			: 'foot'
	}
	else if (player.occupyingSeat !== null) nextMode = 'passenger'
	else nextMode = 'foot'

	let nearV = false
	if (nextMode === 'foot')
	{
		for (const v of w.vehicles)
		{
			if (player.position.distanceTo(v.position) < NEAR_VEHICLE_DISTANCE)
			{
				nearV = true
				break
			}
		}
	}

	if (nextMode !== mode.value) mode.value = nextMode
	if (nearV !== nearVehicle.value) nearVehicle.value = nearV
}

onMounted(() =>
{
	rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() =>
{
	if (rafId !== null) cancelAnimationFrame(rafId)
	releaseAllDirections()
	releaseSprintAuto()
})

// --- Pointer handlers (joystick + camera + tap-jump) ------------------

const onPointerDown = (e: PointerEvent): void =>
{
	if (e.pointerType === 'mouse') { touchMode.exit(); return }
	if (e.target instanceof Element && e.target.closest('.touch-btn')) return
	if (e.target instanceof Element && e.target.closest('.lil-gui, .modal-backdrop, .dialog-bar, .planet-menu, .title-screen, .debug-panel'))
	{
		return
	}

	touchMode.enter()
	e.preventDefault()

	const slot = fingers[0] === null ? 0 : (fingers[1] === null ? 1 : -1)
	if (slot === -1) return
	const role: FingerRole = slot === 0 ? 'joystick' : 'camera'
	fingers[slot] = {
		pointerId: e.pointerId,
		role,
		startX: e.clientX,
		startY: e.clientY,
		startTime: Date.now(),
		currentX: e.clientX,
		currentY: e.clientY,
	}

	if (e.target !== null && e.target instanceof Element)
	{
		try { e.target.setPointerCapture(e.pointerId) } catch (_) { /* noop */ }
	}

	if (role === 'joystick')
	{
		joystickActive.value = true
		joystickPos.value = { x: e.clientX, y: e.clientY }
		joystickThumb.value = { x: 0, y: 0 }
	}
}

const onPointerMove = (e: PointerEvent): void =>
{
	if (e.pointerType === 'mouse') return
	const finger = findFingerByPointerId(e.pointerId)
	if (finger === null) return

	const dx = e.clientX - finger.currentX
	const dy = e.clientY - finger.currentY
	finger.currentX = e.clientX
	finger.currentY = e.clientY

	if (finger.role === 'joystick') applyJoystick(e.clientX, e.clientY, finger)
	else dispatchMouseMove(dx * TOUCH_CAM_SENSITIVITY, dy * TOUCH_CAM_SENSITIVITY)
}

const onPointerUp = (e: PointerEvent): void =>
{
	if (e.pointerType === 'mouse') return
	const finger = findFingerByPointerId(e.pointerId)
	if (finger === null) return

	const duration = Date.now() - finger.startTime
	const totalDx = e.clientX - finger.startX
	const totalDy = e.clientY - finger.startY
	const drift = Math.sqrt(totalDx * totalDx + totalDy * totalDy)

	if (drift <= TAP_MAX_MOVE && duration < TAP_MAX_TIME && mode.value === 'foot')
	{
		dispatchKey('Space', true)
		setTimeout(() => dispatchKey('Space', false), 80)
	}

	if (finger.role === 'joystick')
	{
		joystickActive.value = false
		joystickThumb.value = { x: 0, y: 0 }
		releaseAllDirections()
		releaseSprintAuto()
	}

	const slot = fingers.indexOf(finger)
	if (slot !== -1) fingers[slot] = null
}

const findFingerByPointerId = (pointerId: number): FingerSlot | null =>
{
	for (const f of fingers) if (f !== null && f.pointerId === pointerId) return f
	return null
}

const applyJoystick = (cx: number, cy: number, finger: FingerSlot): void =>
{
	const dx = cx - finger.startX
	const dy = cy - finger.startY
	const len = Math.sqrt(dx * dx + dy * dy)
	const clampedLen = Math.min(len, JOYSTICK_RADIUS)
	const nx = len > 0 ? (dx / len) * clampedLen : 0
	const ny = len > 0 ? (dy / len) * clampedLen : 0

	joystickThumb.value = { x: nx, y: ny }

	const normX = nx / JOYSTICK_RADIUS
	const normY = ny / JOYSTICK_RADIUS
	const magnitude = Math.sqrt(normX * normX + normY * normY)

	setDirection('KeyA', normX < -JOYSTICK_DEADZONE)
	setDirection('KeyD', normX > JOYSTICK_DEADZONE)
	setDirection('KeyW', normY < -JOYSTICK_DEADZONE)
	setDirection('KeyS', normY > JOYSTICK_DEADZONE)

	if (mode.value === 'foot')
	{
		const wantSprint = magnitude > SPRINT_AUTO_THRESHOLD
		if (wantSprint && !sprintAuto) { dispatchKey('ShiftLeft', true); sprintAuto = true }
		else if (!wantSprint && sprintAuto) { dispatchKey('ShiftLeft', false); sprintAuto = false }
	}
}

useEventListener(document, 'pointerdown', onPointerDown, { passive: false })
useEventListener(document, 'pointermove', onPointerMove, { passive: false })
useEventListener(document, 'pointerup', onPointerUp)
useEventListener(document, 'pointercancel', onPointerUp)

// Real keyboard press drops touch mode again so hybrid devices (a
// laptop + touchscreen) flip back to keyboard HUD as soon as the
// user types. `isTrusted` filters out our OWN synthesised events.
useEventListener(document, 'keydown', (e: KeyboardEvent) =>
{
	if (!e.isTrusted) return
	if (!touchMode.active.value) return
	if (KEYBOARD_DEACTIVATE_KEYS.has(e.code)) touchMode.exit()
})

// --- Button cluster ---------------------------------------------------

interface BtnSpec
{
	id: string
	label: string | (() => string)
	code: string
	primary?: boolean
}

const visibleButtons = computed<BtnSpec[]>(() =>
{
	if (mode.value === 'dialog') return []
	if (mode.value === 'foot')
	{
		const out: BtnSpec[] = []
		if (nearDialogCount.value > 0) out.push({ id: 'talk', label: t('touch.talk'), code: 'KeyE', primary: true })
		if (nearInteractCount.value > 0 || nearVehicle.value)
		{
			out.push({ id: 'action', label: t('touch.action'), code: 'KeyF', primary: out.length === 0 })
		}
		return out
	}
	if (mode.value === 'car' || mode.value === 'boat')
	{
		return [
			{ id: 'action', label: t('touch.action'), code: 'KeyF', primary: true },
			{ id: 'brake',  label: t('touch.brake'),  code: 'Space' },
			{ id: 'view',   label: t('touch.view'),   code: 'KeyV' },
			{ id: 'seat',   label: t('touch.seat'),   code: 'KeyX' },
		]
	}
	if (mode.value === 'aircraft')
	{
		return [
			{ id: 'action',    label: t('touch.action'),   code: 'KeyF', primary: true },
			{ id: 'up',        label: t('touch.up'),       code: 'ShiftLeft' },
			{ id: 'down',      label: t('touch.down'),     code: 'Space' },
			{ id: 'yaw-left',  label: t('touch.yawLeft'),  code: 'KeyQ' },
			{ id: 'yaw-right', label: t('touch.yawRight'), code: 'KeyE' },
			{ id: 'view',      label: t('touch.view'),     code: 'KeyV' },
		]
	}
	if (mode.value === 'rocket')
	{
		return [
			{ id: 'action', label: t('touch.action'), code: 'KeyF', primary: true },
			{ id: 'down',   label: '🚀',               code: 'Space' },
		]
	}
	if (mode.value === 'passenger')
	{
		return [
			{ id: 'action', label: t('touch.action'), code: 'KeyF', primary: true },
			{ id: 'seat',   label: t('touch.seat'),   code: 'KeyX' },
		]
	}
	return []
})

const onBtnDown = (btn: BtnSpec, e: PointerEvent): void =>
{
	e.preventDefault()
	e.stopPropagation()
	const target = e.target as Element
	try { target.setPointerCapture(e.pointerId) } catch (_) { /* noop */ }
	if (btn.code === 'KeyE') window.dispatchEvent(new CustomEvent('touch-interact', { detail: { kind: 'dialog' } }))
	else if (btn.code === 'KeyF') window.dispatchEvent(new CustomEvent('touch-interact', { detail: { kind: 'interact' } }))
	dispatchKey(btn.code, true)
}

const onBtnUp = (btn: BtnSpec, e: PointerEvent): void =>
{
	e.preventDefault()
	e.stopPropagation()
	const target = e.target as Element
	try { target.releasePointerCapture(e.pointerId) } catch (_) { /* noop */ }
	dispatchKey(btn.code, false)
}
</script>

<template>
	<div class="touch-controls" :data-mode="mode">
		<!-- Joystick -->
		<div
			class="touch-joystick"
			:class="{ 'touch-joystick--active': joystickActive }"
			:style="{
				left: `${joystickPos.x - 70}px`,
				top: `${joystickPos.y - 70}px`,
			}"
		>
			<div
				class="touch-joystick__thumb"
				:style="{ transform: `translate(calc(-50% + ${joystickThumb.x}px), calc(-50% + ${joystickThumb.y}px))` }"
			/>
		</div>

		<!-- Button cluster -->
		<div class="touch-cluster">
			<button
				v-for="(btn, i) in visibleButtons"
				:key="btn.id"
				class="touch-btn"
				:class="{ 'touch-btn--primary': btn.primary, 'touch-btn--secondary': !btn.primary }"
				:data-slot="i"
				@pointerdown="onBtnDown(btn, $event)"
				@pointerup="onBtnUp(btn, $event)"
				@pointercancel="onBtnUp(btn, $event)"
			>
				{{ typeof btn.label === 'function' ? btn.label() : btn.label }}
			</button>
		</div>
	</div>
</template>

<style scoped>
.touch-controls
{
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: var(--z-overlay);
	/* Hidden by default - only on touch-active does the cluster +
	   joystick become reachable. Joystick relies on visibility from
	   its `.active` class anyway. */
	display: none;
}

:global(html.touch-active) .touch-controls
{
	display: block;
}

.touch-joystick
{
	position: fixed;
	width: 140px;
	height: 140px;
	border-radius: var(--radius-full);
	background: rgba(255, 255, 255, 0.1);
	border: 2px solid rgba(255, 255, 255, 0.3);
	display: none;
	pointer-events: none;
}

.touch-joystick--active
{
	display: block;
}

.touch-joystick__thumb
{
	position: absolute;
	left: 50%;
	top: 50%;
	width: 56px;
	height: 56px;
	border-radius: var(--radius-full);
	background: rgba(255, 255, 255, 0.4);
	border: 2px solid rgba(255, 255, 255, 0.6);
	transform: translate(-50%, -50%);
}

.touch-cluster
{
	position: fixed;
	right: var(--space-4);
	bottom: var(--space-6);
	display: flex;
	flex-direction: column-reverse;
	gap: var(--space-2);
	align-items: flex-end;
	pointer-events: auto;
}

.touch-btn
{
	all: unset;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-full);
	background: rgba(255, 255, 255, 0.18);
	border: 2px solid rgba(255, 255, 255, 0.45);
	color: #fff;
	font-family: var(--font-mono);
	font-weight: var(--weight-bold);
	cursor: pointer;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	transition: background var(--motion-fast) var(--ease-default);
}

.touch-btn--primary
{
	width: 84px;
	height: 84px;
	font-size: var(--text-h3);
}

.touch-btn--secondary
{
	width: 56px;
	height: 56px;
	font-size: var(--text-body);
}

.touch-btn:active
{
	background: var(--color-primary);
	color: var(--color-on-primary);
}

/* Hide on dialog mode - dialog choices own the bottom edge. */
.touch-controls[data-mode='dialog'] .touch-cluster
{
	display: none;
}
</style>
