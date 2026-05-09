<!--
  DialogBox - branching NPC dialog overlay. Replaces engine/world/ui/
  DialogBox.ts. Composes a portrait card + speaker line + typewritten
  body + numbered choice buttons. Typewriter logic lives in
  useDialogTypewriter (extracted for testability).

  Keyboard:
    - Digit / Numpad 1-9: pick the matching choice (after typing done)
    - E / Enter / Space while typing: skip to end
    - Esc deliberately does NOTHING - every dialog tree has an `end`
      branch; players exit by picking it. Mirrors the original.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useEventListener } from '@vueuse/core'

const { dialog, currentNodeId, isOpen, pickChoice } = useDialog()

const node = computed(() =>
{
	if (dialog.value === null || currentNodeId.value === null) return null
	return dialog.value.nodes[currentNodeId.value] ?? null
})

const text = computed(() => node.value?.text ?? '')

const { visible: typed, isTyping, finish } = useDialogTypewriter(text)

useEventListener(window, 'keydown', (e: KeyboardEvent) =>
{
	if (!isOpen.value) return

	if (isTyping.value && (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space'))
	{
		e.preventDefault()
		finish()
		return
	}
	if (isTyping.value) return

	const num = e.code.startsWith('Digit') ? parseInt(e.code.slice(5), 10) - 1
		: e.code.startsWith('Numpad') ? parseInt(e.code.slice(6), 10) - 1 : -1
	if (num >= 0 && num < 9 && node.value !== null && num < node.value.choices.length)
	{
		e.preventDefault()
		pickChoice(num)
	}
})

const portrait = computed(() => node.value?.portrait ?? node.value?.speaker.charAt(0).toUpperCase() ?? '?')

const onBoxClick = (): void =>
{
	// Skip-to-end on bar click while typing. Choice buttons stop
	// propagation in their own handler so picking a choice doesn't
	// land here.
	if (isTyping.value) finish()
}
</script>

<template>
	<Teleport to="body">
		<div v-if="isOpen && node !== null" class="dialog-bar" @click="onBoxClick">
			<div class="dialog-bar__dim" />
			<div class="dialog-bar__box">
				<aside class="dialog-bar__portrait">
					<div class="dialog-bar__avatar">{{ portrait }}</div>
					<div class="dialog-bar__name">{{ node.speaker }}</div>
					<div class="dialog-bar__role">{{ node.role ?? '' }}</div>
				</aside>
				<div class="dialog-bar__content">
					<div class="dialog-bar__speaker">{{ node.speaker }}</div>
					<div class="dialog-bar__text">{{ typed }}</div>
					<div v-show="!isTyping" class="dialog-bar__choices" role="menu">
						<button
							v-for="(choice, i) in node.choices"
							:key="i"
							class="dialog-bar__choice"
							role="menuitem"
							@click.stop="pickChoice(i)"
						>
							<span class="dialog-bar__key">{{ i + 1 }}</span>
							<span>{{ choice.label }}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.dialog-bar
{
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 0 var(--space-8) var(--space-6);
	z-index: var(--z-overlay);
	pointer-events: auto;
}

.dialog-bar__dim
{
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.22);
	pointer-events: none;
	z-index: -1;
}

.dialog-bar__box
{
	background: var(--color-overlay-bg);
	border: 2px solid rgba(255, 185, 0, 0.45);
	border-radius: var(--radius-xl);
	backdrop-filter: blur(10px);
	display: flex;
	min-height: 170px;
	overflow: hidden;
	box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 185, 0, 0.12);
	max-width: 1100px;
	margin: 0 auto;
}

.dialog-bar__portrait
{
	width: 148px;
	flex-shrink: 0;
	background: rgba(255, 185, 0, 0.06);
	border-right: 2px solid rgba(255, 185, 0, 0.25);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: var(--space-4) var(--space-3);
	gap: var(--space-2);
}

.dialog-bar__avatar
{
	width: 88px;
	height: 88px;
	background: linear-gradient(135deg, var(--color-tertiary) 0%, #3a7090 100%);
	border-radius: var(--radius-full);
	border: 3px solid rgba(255, 185, 0, 0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 0 22px rgba(255, 185, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.4);
	color: #fff;
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h2);
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.dialog-bar__name
{
	font-family: var(--font-label);
	font-weight: var(--weight-bold);
	font-size: var(--text-body-sm);
	color: var(--color-primary);
	text-align: center;
	letter-spacing: var(--tracking-wide);
}

.dialog-bar__role
{
	font-family: var(--font-label);
	font-size: var(--text-caption);
	color: var(--color-overlay-text-soft);
	text-align: center;
}

.dialog-bar__content
{
	flex: 1;
	padding: var(--space-4) var(--space-6);
	display: flex;
	flex-direction: column;
}

.dialog-bar__speaker
{
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h4);
	color: var(--color-primary);
	margin-bottom: var(--space-2);
	padding-bottom: var(--space-2);
	border-bottom: 1px solid rgba(255, 185, 0, 0.2);
}

.dialog-bar__text
{
	font-family: var(--font-body);
	font-size: var(--text-body);
	color: var(--color-overlay-text);
	line-height: var(--leading-relaxed);
	flex: 1;
	margin-bottom: var(--space-3);
}

.dialog-bar__choices
{
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
	margin-top: var(--space-2);
}

.dialog-bar__choice
{
	all: unset;
	display: flex;
	align-items: center;
	gap: var(--space-3);
	padding: var(--space-2) var(--space-3);
	background: var(--color-overlay-choice-bg);
	border: 1px solid var(--color-overlay-choice-border);
	border-radius: var(--radius-md);
	color: var(--color-overlay-text);
	font-family: var(--font-body);
	font-size: var(--text-body-sm);
	cursor: pointer;
	transition: background var(--motion-fast) var(--ease-default), border-color var(--motion-fast) var(--ease-default);
}

.dialog-bar__choice:hover,
.dialog-bar__choice:focus-visible
{
	background: var(--color-overlay-choice-bg-hover);
	border-color: rgba(255, 185, 0, 0.45);
}

.dialog-bar__key
{
	display: inline-block;
	min-width: 1.4em;
	text-align: center;
	font-family: var(--font-mono);
	font-weight: var(--weight-bold);
	font-size: var(--text-caption);
	background: rgba(255, 185, 0, 0.18);
	border: 1px solid rgba(255, 185, 0, 0.35);
	color: var(--color-primary);
	padding: 1px 6px;
	border-radius: var(--radius-sm);
	flex-shrink: 0;
}

@media (max-width: 600px)
{
	.dialog-bar
	{
		top: 0;
		bottom: auto;
		padding: var(--space-3);
	}
	.dialog-bar__dim { display: none; }
	.dialog-bar__box
	{
		flex-direction: column;
		min-height: 0;
		max-height: calc(100vh - var(--space-6));
		backdrop-filter: none;
	}
	.dialog-bar__portrait
	{
		width: 100%;
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-areas: "img name" "img role";
		gap: 0 var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-right: none;
		border-bottom: 2px solid rgba(255, 185, 0, 0.25);
		align-items: center;
	}
	.dialog-bar__avatar
	{
		grid-area: img;
		width: 48px;
		height: 48px;
		font-size: var(--text-h4);
		border-width: 2px;
	}
	.dialog-bar__name { grid-area: name; align-self: end; text-align: left; }
	.dialog-bar__role { grid-area: role; align-self: start; text-align: left; }
	.dialog-bar__content { padding: var(--space-3) var(--space-4) var(--space-4); min-height: 0; }
	.dialog-bar__text { font-size: var(--text-body-sm); max-height: 28vh; overflow-y: auto; margin-bottom: 0; }
	.dialog-bar__choices
	{
		position: fixed;
		left: var(--space-3);
		right: var(--space-3);
		bottom: var(--space-4);
		margin-top: 0;
		z-index: 1;
		background: var(--color-overlay-bg);
		border: 2px solid rgba(255, 185, 0, 0.45);
		border-radius: var(--radius-xl);
		padding: var(--space-3);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
	}
}
</style>
