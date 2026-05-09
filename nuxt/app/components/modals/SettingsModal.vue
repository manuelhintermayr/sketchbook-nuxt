<!--
  SettingsModal - 4-card settings dialog opened from the PauseMenu.
  Replaces engine/world/ui/SettingsModal.ts. v-model directly against
  useEngineParams + useUserPrefs - no controller cache, no lil-gui
  bridge, no dual source of truth.

  Cards:
    - General: Language, Dark mode, Reset
    - Graphics: Quality preset, Shadows, FXAA, Sun cycle, Outlines,
      Labels, FPS counter
    - Audio: Master + sub-toggles, Master volume, Music volume
    - Controls: Mouse sensitivity, Free-cam speed, Gravity scale,
      Camera shake
-->

<script setup lang="ts">
import type { SbLocale } from '~/composables/useUserPrefs'

const { t } = useI18n()
const { locale, darkMode, soundMuted } = useUserPrefs()
const params = useEngineParams()
const settings = useSettingsModal()
const iris = useIris()

const LOCALE_OPTIONS = [
	{ value: 'en', label: 'English' },
	{ value: 'de', label: 'Deutsch' },
	{ value: 'es', label: 'Español' },
]

// Quality preset toggles two heavy graphics rows in lockstep.
const applyPreset = (preset: 'low' | 'high'): void =>
{
	if (preset === 'low')
	{
		params.Shadows = false
		params.Outlines = false
	}
	else
	{
		params.Shadows = true
		params.Outlines = true
	}
}

// Language change requires a reload because vue-i18n's cached t() in
// the engine's bind closure has the old locale. The iris-wipe covers
// the flash. localStorage.setItem isn't needed - useUserPrefs writes
// it via useLocalStorage.
const onLocaleChange = async (next: string): Promise<void> =>
{
	if (next === locale.value) return
	locale.value = next as SbLocale
	await iris.close()
	location.reload()
}

const onReset = async (): Promise<void> =>
{
	const keys = [
		'sketchbook-settings',
		'sketchbook.darkMode',
		'sketchbook.soundMuted',
		'sketchbook.locale',
		'sketchbook.map',
	]
	for (const k of keys) try { localStorage.removeItem(k) } catch (_e) { /* noop */ }
	await iris.close()
	location.reload()
}

// Mirror Master_Audio + Dark_Mode writes into useUserPrefs so the
// title screen + DebugPanel see the same state. Both ways: useUserPrefs
// changes (theme toggle on the title screen) feed into params.X via the
// other DebugPanel watch already.
watch(() => params.Master_Audio, (v) => { soundMuted.value = !v })
watch(() => params.Dark_Mode, (v) =>
{
	darkMode.value = v
	document.documentElement.classList.toggle('dark', v)
})
</script>

<template>
	<BaseModal
		id="settings"
		:visible="settings.visible.value"
		backdrop-close
		@close="settings.close()"
	>
		<header class="settings__header">
			<h2 class="settings__title">{{ t('settings.title') }}</h2>
			<button
				type="button"
				class="settings__close"
				:aria-label="t('settings.done')"
				@click="settings.close()"
			>&times;</button>
		</header>

		<SbCard class="settings__card">
			<template #title>{{ t('settings.general') }}</template>
			<DebugSelect
				:model-value="locale"
				:label="t('settings.language')"
				:options="LOCALE_OPTIONS"
				@update:model-value="onLocaleChange"
			/>
			<p class="settings__desc">{{ t('settings.languageDesc') }}</p>
			<DebugToggle v-model="params.Dark_Mode" :label="t('settings.darkMode')" />
			<p class="settings__desc">{{ t('settings.darkModeDesc') }}</p>
			<DebugButton
				:label="t('settings.resetBtn')"
				tone="danger"
				@click="onReset"
			/>
			<p class="settings__desc">{{ t('settings.resetDesc') }}</p>
		</SbCard>

		<SbCard class="settings__card">
			<template #title>{{ t('settings.graphics') }}</template>
			<div class="settings__presets">
				<DebugButton :label="t('settings.presetLow')" @click="applyPreset('low')" />
				<DebugButton :label="t('settings.presetHigh')" tone="primary" @click="applyPreset('high')" />
			</div>
			<p class="settings__desc">{{ t('settings.presetDesc') }}</p>
			<DebugToggle v-model="params.Shadows"   label="Shadows" />
			<DebugToggle v-model="params.FXAA"      label="Anti-aliasing" />
			<DebugToggle v-model="params.Sun_Cycle" label="Sun cycle" />
			<DebugToggle v-model="params.Outlines"  label="Outlines" />
			<DebugToggle v-model="params.Labels"    label="Labels" />
			<DebugToggle v-model="params.Debug_FPS" label="FPS counter" />
		</SbCard>

		<SbCard class="settings__card">
			<template #title>{{ t('settings.audio') }}</template>
			<DebugToggle v-model="params.Master_Audio" label="Audio" />
			<DebugSlider
				v-model="params.Master_Volume"
				label="Master volume"
				:min="0" :max="100" :step="1"
				:disabled="!params.Master_Audio"
			/>
			<DebugToggle
				v-model="params.Sound_Effects"
				label="Sound effects"
				:disabled="!params.Master_Audio"
			/>
			<DebugToggle
				v-model="params.Background_Music"
				label="Background music"
				:disabled="!params.Master_Audio"
			/>
			<DebugSlider
				v-model="params.Music_Volume"
				label="Music volume"
				:min="0" :max="100" :step="1"
				:disabled="!params.Master_Audio"
			/>
		</SbCard>

		<SbCard class="settings__card">
			<template #title>{{ t('settings.controls') }}</template>
			<DebugSlider v-model="params.Mouse_Sensitivity" label="Mouse sensitivity" :min="0" :max="1"   :step="0.01" />
			<DebugSlider v-model="params.Free_Cam_Speed"    label="Free-camera speed" :min="1" :max="100" :step="1" />
			<DebugSlider v-model="params.Gravity_Scale"     label="Gravity scale"     :min="0" :max="2"   :step="0.05" />
			<DebugToggle v-model="params.Camera_Shake"      label="Camera shake" />
		</SbCard>

		<footer class="settings__footer">
			<button class="settings__done" type="button" @click="settings.close()">
				{{ t('settings.done') }}
			</button>
		</footer>
	</BaseModal>
</template>

<style scoped>
.settings__header
{
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--space-4);
}

.settings__title
{
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h2);
	margin: 0;
}

.settings__close
{
	all: unset;
	font-size: var(--text-h2);
	line-height: 1;
	cursor: pointer;
	padding: var(--space-2);
	color: var(--color-on-surface-variant);
}

.settings__card
{
	margin-bottom: var(--space-4);
}

.settings__desc
{
	font-size: var(--text-caption);
	color: var(--color-on-surface-variant);
	margin: 0 0 var(--space-3);
}

.settings__presets
{
	display: flex;
	gap: var(--space-2);
}

.settings__footer
{
	display: flex;
	justify-content: flex-end;
	margin-top: var(--space-5);
}

.settings__done
{
	all: unset;
	background: var(--color-primary);
	color: var(--color-on-primary);
	font-family: var(--font-label);
	font-weight: var(--weight-bold);
	padding: var(--space-3) var(--space-6);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-gold);
	cursor: pointer;
}
</style>
