<!--
  LapCounter - small race-lap label, only visible while a tracked
  scenario is active (lap !== null). Replaces world.lapCounter
  HTMLElement that Scenario.ts used to mutate via innerHTML.
-->

<script setup lang="ts">
const { lap } = useRaceState()
const { t } = useI18n()
</script>

<template>
	<h1 v-if="lap !== null" class="lap-counter">
		{{ t('world.lap', { n: String(lap) }) }}
	</h1>
</template>

<style scoped>
.lap-counter
{
	position: fixed;
	top: 0;
	left: 50px;
	margin: var(--space-2) 0;
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h2);
	color: var(--color-on-surface-overlay);
	text-shadow: var(--text-shadow-overlay);
	z-index: var(--z-overlay);
	pointer-events: none;
}
</style>
