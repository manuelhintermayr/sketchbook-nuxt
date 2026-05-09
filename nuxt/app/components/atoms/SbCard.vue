<!--
  SbCard - themed card surface used by SettingsModal cards (Block 14)
  + WelcomeModal (Block 12). Uses the surface tokens so the dark-mode
  flip works without per-card overrides. Slot is the body; an optional
  `title` slot renders a heading at the top.
-->

<template>
	<section class="sb-card">
		<header v-if="$slots.title" class="sb-card__title">
			<slot name="title" />
		</header>
		<div class="sb-card__body">
			<slot />
		</div>
	</section>
</template>

<style scoped>
.sb-card
{
	background: var(--color-surface);
	color: var(--color-on-surface);
	border: var(--border-width-sm) solid var(--color-outline-variant);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-md);
	overflow: hidden;
}

.sb-card__title
{
	padding: var(--space-3) var(--space-5);
	border-bottom: var(--border-width-sm) solid var(--color-outline-variant);
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h4);
	background: var(--color-surface-container);
}

.sb-card__body
{
	padding: var(--space-5);
}
</style>
