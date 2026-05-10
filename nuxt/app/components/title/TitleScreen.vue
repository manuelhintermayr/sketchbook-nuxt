<!--
  TitleScreen - first thing the player sees before the engine boots.
  Replaces engine/world/ui/TitleScreen.ts. Composes the Block-8 atoms
  (CubeLoader, KeyCap, IconButton) and the LanguagePicker.

  Click or any keypress dismisses; the parent (EngineHost) catches
  @dismiss and starts the world. The user gesture also unblocks
  AudioContext autoplay on the rest of the engine.
-->

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useEventListener, useColorMode } from '@vueuse/core'

const emit = defineEmits<{ dismiss: [] }>()

const { t } = useI18n()
const { locale, darkMode, soundMuted } = useUserPrefs()

// Apply persisted dark-mode before the title screen renders so the
// page never flashes the wrong theme. The DebugPanel + SettingsModal
// (Blocks 10/14) keep this token in sync once the engine boots.
const colorMode = useColorMode({ storageKey: null as any, attribute: 'class', selector: 'html' })
onMounted(() =>
{
	document.documentElement.classList.toggle('dark', darkMode.value)
})

const visible = ref<boolean>(true)

const dismiss = (): void =>
{
	if (!visible.value) return
	visible.value = false
	// Fade-out then fire the parent.
	setTimeout(() => emit('dismiss'), 400)
}

// Keys: any key dismisses (matches the original engine). Plain
// document.addEventListener avoids the vueuse(window, 'keydown', ...)
// reachability gap observed under Playwright + some Windows configs.
const onAnyKey = (): void => dismiss()
onMounted(() => document.addEventListener('keydown', onAnyKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onAnyKey))

useEventListener(window, 'pointerdown', (e: PointerEvent) =>
{
	// Buttons inside the title screen stop propagation themselves -
	// pickers + toggles must not double as a dismiss gesture.
	if (e.target instanceof Element && e.target.closest('.title-screen__controls'))
	{
		return
	}
	dismiss()
})

const onThemeToggle = (): void =>
{
	darkMode.value = !darkMode.value
	document.documentElement.classList.toggle('dark', darkMode.value)
}

const onSoundToggle = (): void =>
{
	soundMuted.value = !soundMuted.value
}

const promptText = computed(() => t('title.prompt'))
// Highlight any keycap-like token in the localised prompt text by
// wrapping it in a <KeyCap> render. Same word list as the original.
const promptParts = computed(() =>
{
	const re = /\b(any key|eine Taste|Taste|una tecla|tecla|Esc|Space|Leertaste|Enter|F)\b/i
	const parts: Array<{ text: string, key: boolean }> = []
	let s = promptText.value
	let m = re.exec(s)
	while (m !== null)
	{
		if (m.index > 0) parts.push({ text: s.slice(0, m.index), key: false })
		parts.push({ text: m[0], key: true })
		s = s.slice(m.index + m[0].length)
		m = re.exec(s)
	}
	if (s.length > 0) parts.push({ text: s, key: false })
	return parts
})
</script>

<template>
	<Transition name="title-fade">
		<div v-if="visible" class="title-screen" role="dialog" aria-modal="true">
			<div class="title-screen__title">Sketchbook</div>
			<div class="title-screen__version">Version 0.8.0</div>
			<div class="title-screen__cube">
				<CubeLoader bouncy />
			</div>
			<p class="title-screen__prompt">
				<template v-for="(p, i) in promptParts" :key="i">
					<KeyCap v-if="p.key">{{ p.text }}</KeyCap>
					<span v-else>{{ p.text }}</span>
				</template>
			</p>

			<div class="title-screen__controls">
				<span class="title-screen__lang-label">{{ t('title.languagePrompt') }}:</span>
				<LanguagePicker v-model="locale" />
				<IconButton
					:active="darkMode"
					:title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
					aria-label="Toggle dark mode"
					@click.stop="onThemeToggle"
					@pointerdown.stop
				>
					<span class="title-screen__theme-icon" :class="{ 'is-moon': darkMode }" />
				</IconButton>
				<IconButton
					:active="!soundMuted"
					:title="soundMuted ? 'Sound: off (click to enable)' : 'Sound: on (click to mute)'"
					aria-label="Toggle sound"
					@click.stop="onSoundToggle"
					@pointerdown.stop
				>
					<span class="title-screen__sound-icon" :class="{ 'is-muted': soundMuted }" />
				</IconButton>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.title-screen
{
	position: fixed;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: var(--space-4);
	background: linear-gradient(to bottom, var(--color-loading-top) 0%, var(--color-loading-bottom) 100%);
	z-index: var(--z-modal);
	cursor: pointer;
	user-select: none;
	color: #fff;
}

.title-screen__title
{
	font-family: var(--font-headline);
	font-weight: var(--weight-extrabold);
	font-size: clamp(1.8rem, 11vw, 4rem);
	color: #fff;
	text-shadow: var(--text-shadow-overlay);
	margin-bottom: var(--space-2);
	max-width: 100%;
	text-align: center;
	overflow-wrap: break-word;
}

.title-screen__version
{
	font-family: var(--font-label);
	font-weight: var(--weight-medium);
	font-size: var(--text-body);
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: var(--space-8);
}

.title-screen__cube
{
	animation: title-bounce 2s ease-in-out infinite;
}

@keyframes title-bounce
{
	0%, 100% { transform: translateY(0); }
	50%      { transform: translateY(-10px); }
}

.title-screen__prompt
{
	font-family: var(--font-body);
	font-size: var(--text-body);
	color: rgba(255, 255, 255, 0.85);
	text-shadow: var(--text-shadow-overlay);
	animation: title-pulse 2s ease-in-out infinite;
	margin-top: var(--space-8);
}

@keyframes title-pulse
{
	0%, 100% { opacity: 0.7; }
	50%      { opacity: 1; }
}

.title-screen__controls
{
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	gap: var(--space-3);
	margin-top: var(--space-6);
	font-family: var(--font-label);
	font-size: var(--text-body-sm);
	color: rgba(255, 255, 255, 0.85);
	text-shadow: var(--text-shadow-overlay);
	max-width: 100%;
	cursor: default;
}

.title-screen__lang-label
{
	margin-right: var(--space-2);
}

.title-screen__theme-icon
{
	display: inline-block;
	width: 16px;
	height: 16px;
	border-radius: var(--radius-full);
	background: #fff;
	position: relative;
	box-shadow:
		0 -10px 0 -6px #fff,
		0 10px 0 -6px #fff,
		-10px 0 0 -6px #fff,
		10px 0 0 -6px #fff,
		7px -7px 0 -6px #fff,
		-7px -7px 0 -6px #fff,
		7px 7px 0 -6px #fff,
		-7px 7px 0 -6px #fff;
}

.title-screen__theme-icon.is-moon
{
	background: transparent;
	box-shadow: inset -4px -4px 0 0 #fff;
	transform: rotate(-30deg);
}

.title-screen__sound-icon
{
	display: inline-block;
	position: relative;
	width: 14px;
	height: 10px;
	background: #fff;
	clip-path: polygon(0 30%, 35% 30%, 70% 0, 70% 100%, 35% 70%, 0 70%);
}

.title-screen__sound-icon.is-muted::after
{
	content: '';
	position: absolute;
	left: -2px;
	top: 50%;
	width: 18px;
	height: 2px;
	background: #ff5e5e;
	transform: rotate(-30deg);
	transform-origin: 0 50%;
}

.title-fade-leave-active
{
	transition: opacity var(--motion-slow) var(--ease-default);
}
.title-fade-leave-to
{
	opacity: 0;
	pointer-events: none;
}
</style>
