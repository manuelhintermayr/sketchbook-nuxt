<!--
  LanguagePicker - 3-button locale toggle. Used by TitleScreen.
  v-model:string against useUserPrefs().locale (the source of truth);
  the i18n bootstrap plugin re-runs setLocale on every change.
-->

<script setup lang="ts">
import type { SbLocale } from '~/composables/useUserPrefs'

defineProps<{
	modelValue: SbLocale
}>()

const emit = defineEmits<{ 'update:modelValue': [value: SbLocale] }>()

const LOCALES: Array<{ value: SbLocale, label: string }> = [
	{ value: 'en', label: 'English' },
	{ value: 'de', label: 'Deutsch' },
	{ value: 'es', label: 'Español' },
]
</script>

<template>
	<div class="lang-picker">
		<button
			v-for="l in LOCALES"
			:key="l.value"
			type="button"
			class="lang-picker__btn"
			:class="{ 'lang-picker__btn--active': l.value === modelValue }"
			@click="emit('update:modelValue', l.value)"
		>
			{{ l.label }}
		</button>
	</div>
</template>

<style scoped>
.lang-picker
{
	display: inline-flex;
	gap: var(--space-3);
}

.lang-picker__btn
{
	all: unset;
	font-family: var(--font-label);
	font-weight: var(--weight-bold);
	font-size: var(--text-body-sm);
	background: rgba(255, 255, 255, 0.15);
	color: #fff;
	border: 1px solid rgba(255, 255, 255, 0.4);
	border-radius: var(--radius-md);
	padding: var(--space-2) var(--space-4);
	cursor: pointer;
	transition: background var(--motion-fast) var(--ease-default);
}

.lang-picker__btn:hover
{
	background: rgba(255, 255, 255, 0.3);
}

.lang-picker__btn--active
{
	background: var(--color-primary);
	color: var(--color-on-primary);
	border-color: var(--color-primary);
}
</style>
