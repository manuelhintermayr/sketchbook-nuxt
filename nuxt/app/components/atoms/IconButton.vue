<!--
  IconButton - small round button with an active state.
  Reused by TitleScreen (theme + sound toggles), and by other future
  toggle bars. The active state styles itself via the `active` prop
  (cf. the title-screen .title-theme-btn.active pattern).
-->

<script setup lang="ts">
defineProps<{
	active?: boolean
	ariaLabel?: string
	title?: string
}>()
</script>

<template>
	<button
		type="button"
		class="icon-btn"
		:class="{ 'icon-btn--active': active }"
		:aria-label="ariaLabel"
		:title="title"
	>
		<slot />
	</button>
</template>

<style scoped>
.icon-btn
{
	width: 36px;
	height: 36px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.4);
	border-radius: var(--radius-full);
	cursor: pointer;
	padding: 0;
	transition: background var(--motion-fast) var(--ease-default);
	color: inherit;
}

.icon-btn:hover
{
	background: rgba(255, 255, 255, 0.3);
}

.icon-btn--active
{
	background: var(--color-primary);
	color: var(--color-on-primary);
	border-color: var(--color-primary);
}
</style>
