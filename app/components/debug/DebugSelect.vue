<!--
  DebugSelect - label + dropdown. Used by the map switcher (Block 10)
  + the language picker reuse path in SettingsModal (Block 14).
-->

<script setup lang="ts">
defineProps<{
	modelValue: string
	label: string
	options: Array<{ value: string, label: string }>
	disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const onChange = (e: Event): void =>
{
	const target = e.target as HTMLSelectElement
	emit('update:modelValue', target.value)
}
</script>

<template>
	<label class="debug-select" :class="{ 'debug-select--disabled': disabled }">
		<span class="debug-select__label">{{ label }}</span>
		<select
			class="debug-select__input"
			:value="modelValue"
			:disabled="disabled"
			@change="onChange"
		>
			<option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
		</select>
	</label>
</template>

<style scoped>
.debug-select
{
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-2);
	font-family: var(--font-label);
	font-size: var(--text-body-sm);
	color: var(--color-on-surface);
}

.debug-select--disabled
{
	opacity: 0.5;
	pointer-events: none;
}

.debug-select__label
{
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.debug-select__input
{
	font-family: var(--font-label);
	font-size: var(--text-body-sm);
	background: var(--color-surface);
	color: var(--color-on-surface);
	border: var(--border-width-sm) solid var(--color-outline-variant);
	border-radius: var(--radius-sm);
	padding: 2px 6px;
	cursor: pointer;
}
</style>
