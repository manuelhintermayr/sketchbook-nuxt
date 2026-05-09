<!--
  BaseModal - shared chrome for every overlay modal in the app.
  Registers itself with useGameLifecycle on mount so the engine
  pauses + mutes the background while it's open. The Esc key
  dismisses if `dismissible` is true (default), unless the caller
  catches it via @close-attempt to do something custom (e.g. trigger
  the Reload action instead of closing the error overlay).
-->

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useEventListener } from '@vueuse/core'

const props = withDefaults(defineProps<{
	id: string
	visible: boolean
	dismissible?: boolean
	backdropClose?: boolean
}>(), {
	dismissible: true,
	backdropClose: false,
})

const emit = defineEmits<{
	close: []
	'close-attempt': []
}>()

const { register, unregister } = useGameLifecycle()

watch(() => props.visible, (open) =>
{
	if (open) register(props.id)
	else unregister(props.id)
}, { immediate: true })

onBeforeUnmount(() => unregister(props.id))

const requestClose = (): void =>
{
	if (!props.dismissible)
	{
		emit('close-attempt')
		return
	}
	emit('close')
}

useEventListener(window, 'keydown', (e: KeyboardEvent) =>
{
	if (!props.visible) return
	if (e.code === 'Escape')
	{
		e.preventDefault()
		requestClose()
	}
})

const onBackdropClick = (e: MouseEvent): void =>
{
	if (!props.backdropClose) return
	if (e.target !== e.currentTarget) return
	requestClose()
}
</script>

<template>
	<Teleport to="body">
		<Transition name="modal-fade">
			<div
				v-if="visible"
				class="modal-backdrop"
				role="dialog"
				aria-modal="true"
				@click="onBackdropClick"
			>
				<div class="modal-frame">
					<slot />
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.modal-backdrop
{
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.55);
	z-index: var(--z-modal);
	padding: var(--space-4);
}

.modal-frame
{
	background: var(--color-overlay-bg);
	color: var(--color-overlay-text);
	border-radius: var(--radius-xl);
	box-shadow: var(--shadow-lg);
	max-width: min(560px, 100%);
	max-height: calc(100vh - 2 * var(--space-8));
	overflow-y: auto;
	padding: var(--space-6) var(--space-8);
	font-family: var(--font-body);
}

.modal-fade-enter-active,
.modal-fade-leave-active
{
	transition: opacity var(--motion-fast) var(--ease-default);
}
.modal-fade-enter-from,
.modal-fade-leave-to
{
	opacity: 0;
}
</style>
