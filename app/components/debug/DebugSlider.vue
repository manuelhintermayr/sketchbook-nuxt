<!--
  DebugSlider - label + range input + numeric value display.
  v-model on a Vue ref / reactive property; works against any
  reactive object (useEngineParams, useUserPrefs, ad-hoc).
-->

<script setup lang="ts">
const props = defineProps<{
	modelValue: number
	label: string
	min: number
	max: number
	step?: number
	disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const onInput = (e: Event): void =>
{
	const target = e.target as HTMLInputElement
	const num = parseFloat(target.value)
	if (!Number.isNaN(num)) emit('update:modelValue', num)
}

const formatted = computed(() =>
	Number.isInteger(props.modelValue) ? String(props.modelValue) : props.modelValue.toFixed(2))
</script>

<template>
	<label class="debug-slider" :class="{ 'debug-slider--disabled': disabled }">
		<span class="debug-slider__label">{{ label }}</span>
		<input
			type="range"
			class="debug-slider__input"
			:min="min"
			:max="max"
			:step="step ?? 0.01"
			:value="modelValue"
			:disabled="disabled"
			@input="onInput"
		>
		<span class="debug-slider__value">{{ formatted }}</span>
	</label>
</template>

<style scoped>
.debug-slider
{
	display: grid;
	grid-template-columns: minmax(0, 1fr) 100px 40px;
	gap: var(--space-2);
	align-items: center;
	font-family: var(--font-label);
	font-size: var(--text-body-sm);
	color: var(--color-on-surface);
}

.debug-slider--disabled
{
	opacity: 0.5;
	pointer-events: none;
}

.debug-slider__label
{
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.debug-slider__input
{
	width: 100%;
	accent-color: var(--color-primary);
}

.debug-slider__value
{
	font-family: var(--font-mono);
	color: var(--color-on-surface-variant);
	text-align: right;
}
</style>
