<!--
  DebugFolder - collapsible group for debug panel + settings cards.
  Replaces lil-gui's folder concept. Persists open / closed state in
  localStorage under a caller-provided key so a HMR or page reload
  reopens what was open.
-->

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

const props = defineProps<{
	title: string
	storageKey?: string
	defaultOpen?: boolean
}>()

const open = props.storageKey
	? useLocalStorage(`sketchbook.debug.folder.${props.storageKey}`, !!props.defaultOpen)
	: ref(!!props.defaultOpen)
</script>

<template>
	<section class="debug-folder" :class="{ 'debug-folder--open': open }">
		<button
			type="button"
			class="debug-folder__head"
			:aria-expanded="open"
			@click="open = !open"
		>
			<span class="debug-folder__chevron" aria-hidden="true">▶</span>
			<span class="debug-folder__title">{{ title }}</span>
		</button>
		<div v-show="open" class="debug-folder__body">
			<slot />
		</div>
	</section>
</template>

<style scoped>
.debug-folder
{
	border-bottom: var(--border-width-sm) solid var(--color-outline-variant);
}

.debug-folder__head
{
	all: unset;
	display: flex;
	align-items: center;
	gap: var(--space-2);
	width: 100%;
	padding: var(--space-2) var(--space-3);
	background: var(--color-surface-container);
	color: var(--color-on-surface);
	font-family: var(--font-label);
	font-weight: var(--weight-medium);
	font-size: var(--text-body-sm);
	cursor: pointer;
	box-sizing: border-box;
}

.debug-folder__head:hover
{
	background: var(--color-surface-container-high);
}

.debug-folder__chevron
{
	display: inline-block;
	transition: transform var(--motion-fast) var(--ease-default);
	font-size: 0.7em;
	color: var(--color-on-surface-variant);
}

.debug-folder--open .debug-folder__chevron
{
	transform: rotate(90deg);
}

.debug-folder__body
{
	padding: var(--space-2) var(--space-3);
	background: var(--color-surface);
	display: flex;
	flex-direction: column;
	gap: var(--space-1);
}
</style>
