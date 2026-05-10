<!--
  PauseMenu - Esc-driven pause overlay. Replaces engine/world/ui/
  PauseMenu.ts. Listens for Escape via vueuse useEventListener (auto
  cleanup), registers itself with useGameLifecycle on visible so the
  engine pauses while it's up.

  4 actions:
    - Resume: close the menu
    - Settings: hand off to whoever registered via setSettingsHandler
      (Block 14 - SettingsModal.vue)
    - Restart: dispatch through the Restart handler the engine
      registered (World.restartScenario)
    - Reload: iris-wipe + location.reload
-->

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

const { t } = useI18n()
const pause = usePauseMenu()
const iris = useIris()

// Single responsibility: this handler only OPENS the pause menu.
// Closing is BaseModal's job (its own keydown listener emits @close
// when an open modal is dismissed via Esc). Both listeners are bound
// to document and fire on the same Esc press; BaseModal mounts first
// (child) so it runs first and calls e.preventDefault() before us.
// The defaultPrevented check is what stops us from immediately
// re-opening a menu BaseModal just closed.
//
// Plain document.addEventListener matches the original engine's
// KeyboardEventControl and avoids the vueuse(window, 'keydown', ...)
// reachability gap observed under Playwright + some Windows configs.
const onKeyDown = (e: KeyboardEvent): void =>
{
	if (e.code !== 'Escape') return
	if (e.defaultPrevented) return
	if (!pause.enabled.value) return
	e.preventDefault()
	pause.open()
}
onMounted(() => document.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeyDown))

const onResume = (): void =>
{
	pause.close()
}

const onSettings = (): void =>
{
	pause.fireSettings()
}

const onRestart = (): void =>
{
	pause.close()
	pause.fireRestart()
}

const onReload = async (): Promise<void> =>
{
	await iris.close()
	location.reload()
}
</script>

<template>
	<BaseModal
		id="pause"
		:visible="pause.visible.value"
		backdrop-close
		@close="pause.close()"
	>
		<h1 class="pause-title">{{ t('pause.title') }}</h1>
		<nav class="pause-menu" role="menu">
			<button class="pause-btn" type="button" role="menuitem" @click="onResume">
				<span class="pause-icon" aria-hidden="true">&#9654;</span>
				<span>{{ t('pause.resume') }}</span>
			</button>
			<button class="pause-btn" type="button" role="menuitem" @click="onSettings">
				<span class="pause-icon" aria-hidden="true">&#9881;</span>
				<span>{{ t('pause.settings') }}</span>
			</button>
			<button class="pause-btn" type="button" role="menuitem" @click="onRestart">
				<span class="pause-icon" aria-hidden="true">&#8634;</span>
				<span>{{ t('pause.restart') }}</span>
			</button>
			<button class="pause-btn pause-btn--danger" type="button" role="menuitem" @click="onReload">
				<span class="pause-icon" aria-hidden="true">&#8629;</span>
				<span>{{ t('pause.reload') }}</span>
			</button>
		</nav>
		<p class="pause-hint">
			{{ t('pause.hint', { key: '__ESC__' }).split('__ESC__')[0] }}
			<KeyCap>Esc</KeyCap>
			{{ t('pause.hint', { key: '__ESC__' }).split('__ESC__')[1] }}
		</p>
	</BaseModal>
</template>

<style scoped>
.pause-title
{
	font-family: var(--font-headline);
	font-weight: var(--weight-extrabold);
	font-size: var(--text-h1);
	color: #fff;
	text-shadow: var(--text-shadow-overlay);
	margin: 0 0 var(--space-8);
	text-align: center;
	letter-spacing: var(--tracking-wide);
}

.pause-menu
{
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
	min-width: 280px;
	margin: 0 auto;
}

.pause-btn
{
	all: unset;
	display: flex;
	align-items: center;
	gap: var(--space-3);
	padding: var(--space-4) var(--space-6);
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: var(--radius-lg);
	color: #fff;
	font-family: var(--font-body);
	font-size: var(--text-body);
	font-weight: var(--weight-bold);
	cursor: pointer;
	transition: background var(--motion-fast) var(--ease-default), border-color var(--motion-fast) var(--ease-default);
}

.pause-btn:hover,
.pause-btn:focus-visible
{
	background: rgba(255, 255, 255, 0.2);
	border-color: var(--color-primary);
	outline: none;
}

.pause-btn--danger
{
	border-color: var(--color-error);
}

.pause-btn--danger:hover,
.pause-btn--danger:focus-visible
{
	background: rgba(211, 47, 47, 0.18);
	border-color: var(--color-error);
}

.pause-icon
{
	display: inline-block;
	width: 1.25rem;
	text-align: center;
	font-family: var(--font-mono);
	font-weight: var(--weight-bold);
}

.pause-hint
{
	font-family: var(--font-label);
	font-size: var(--text-caption);
	color: rgba(255, 255, 255, 0.85);
	margin-top: var(--space-8);
	text-align: center;
}
</style>
