<!--
  DebugToggle - label + binary on/off pill switch. Replaces lil-gui's
  add(boolean) checkbox. v-model:boolean.
-->

<script setup lang="ts">
defineProps<{
	modelValue: boolean
	label: string
	disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
	<label class="debug-toggle" :class="{ 'debug-toggle--disabled': disabled }">
		<span class="debug-toggle__label">{{ label }}</span>
		<button
			type="button"
			class="debug-toggle__pill"
			:class="{ 'debug-toggle__pill--on': modelValue }"
			:disabled="disabled"
			:aria-pressed="modelValue"
			@click="emit('update:modelValue', !modelValue)"
		>
			<span class="debug-toggle__knob" />
		</button>
	</label>
</template>

<style scoped>
.debug-toggle
{
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-2);
	font-family: var(--font-label);
	font-size: var(--text-body-sm);
	color: var(--color-on-surface);
	cursor: pointer;
}

.debug-toggle--disabled
{
	opacity: 0.5;
	pointer-events: none;
}

.debug-toggle__label
{
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.debug-toggle__pill
{
	all: unset;
	width: 36px;
	height: 20px;
	border-radius: var(--radius-pill);
	background: var(--color-outline-variant);
	position: relative;
	transition: background var(--motion-fast) var(--ease-default);
	cursor: pointer;
	flex: none;
}

.debug-toggle__pill--on
{
	background: var(--color-primary);
}

.debug-toggle__knob
{
	position: absolute;
	top: 2px;
	left: 2px;
	width: 16px;
	height: 16px;
	border-radius: var(--radius-full);
	background: #fff;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	transition: transform var(--motion-fast) var(--ease-default);
}

.debug-toggle__pill--on .debug-toggle__knob
{
	transform: translateX(16px);
}
</style>
