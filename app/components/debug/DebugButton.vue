<!--
  DebugButton - action button (Reset_World_Settings, Restart Scenario,
  scenario launch buttons). Plain @click handler; no v-model.
-->

<script setup lang="ts">
defineProps<{
	label: string
	disabled?: boolean
	tone?: 'default' | 'primary' | 'danger'
}>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
	<button
		type="button"
		class="debug-button"
		:class="`debug-button--${tone ?? 'default'}`"
		:disabled="disabled"
		@click="emit('click')"
	>
		{{ label }}
	</button>
</template>

<style scoped>
.debug-button
{
	all: unset;
	display: block;
	width: 100%;
	box-sizing: border-box;
	padding: var(--space-2) var(--space-3);
	background: var(--color-surface-container-high);
	color: var(--color-on-surface);
	font-family: var(--font-label);
	font-size: var(--text-body-sm);
	font-weight: var(--weight-medium);
	border-radius: var(--radius-sm);
	cursor: pointer;
	text-align: center;
	transition: background var(--motion-fast) var(--ease-default);
}

.debug-button:hover
{
	background: var(--color-surface-container-highest);
}

.debug-button:disabled
{
	opacity: 0.5;
	pointer-events: none;
}

.debug-button--primary
{
	background: var(--color-primary);
	color: var(--color-on-primary);
}

.debug-button--primary:hover
{
	background: var(--color-primary-shadow);
}

.debug-button--danger
{
	background: var(--color-error);
	color: var(--color-on-error);
}
</style>
