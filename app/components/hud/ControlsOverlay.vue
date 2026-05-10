<!--
  ControlsOverlay - left-side panel listing the active key bindings
  for the currently controlled entity. Engine code (Character /
  Vehicle states) writes through useControls; this component renders
  one row per entry, using KeyCap atoms for the key labels.

  Z toggles visibility in the engine (World.toggleControlsOverlay
  -> useHud().controlsOverlay). Hidden during dialogs - dialog-active
  is set on <html> by the dialog flow in Block 15.
-->

<script setup lang="ts">
const { rows } = useControls()
const { controlsOverlay } = useHud()
const { t } = useI18n()

const isJoinerKey = (k: string): boolean =>
	k === '+' || k === 'and' || k === 'or' || k === '&'
</script>

<template>
	<aside v-show="controlsOverlay && rows.length > 0" class="controls-overlay">
		<h2 class="controls-overlay__title">{{ t('controls.header') }}</h2>
		<div v-for="(row, i) in rows" :key="i" class="controls-overlay__row">
			<template v-for="(k, j) in row.keys" :key="j">
				<span v-if="isJoinerKey(k)" class="controls-overlay__joiner">&nbsp;{{ k }}&nbsp;</span>
				<KeyCap v-else>{{ k }}</KeyCap>
			</template>
			<span class="controls-overlay__desc">{{ row.desc }}</span>
		</div>
	</aside>
</template>

<style scoped>
.controls-overlay
{
	position: fixed;
	left: 0;
	bottom: 0;
	padding: var(--space-5);
	max-width: 360px;
	color: var(--color-on-surface-overlay);
	text-shadow: var(--text-shadow-overlay);
	pointer-events: none;
	z-index: var(--z-overlay);
	font-family: var(--font-body);
}

.controls-overlay__title
{
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h3);
	margin-bottom: var(--space-3);
}

.controls-overlay__row
{
	margin-bottom: var(--space-2);
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}

.controls-overlay__joiner
{
	font-family: var(--font-body);
	margin: 0 var(--space-1);
}

.controls-overlay__desc
{
	margin-left: var(--space-2);
}
</style>
