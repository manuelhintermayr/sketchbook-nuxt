<!--
  WelcomeModal - shown after the loading screen finishes, before the
  player gets control. Replaces the Swal.fire welcome dialog. The
  open() promise on useStartupModals().welcome resolves on confirm,
  matching the original `Swal.fire(...).then(...)` flow.
-->

<script setup lang="ts">
const { t } = useI18n()
const { welcome } = useStartupModals()
</script>

<template>
	<BaseModal
		id="welcome"
		:visible="welcome.visible.value"
		:dismissible="false"
		@close="welcome.close()"
	>
		<h2 class="welcome__title">{{ t('world.welcome.title') }}</h2>
		<p class="welcome__body">{{ t('world.welcome.body1') }}</p>
		<p class="welcome__body">{{ t('world.welcome.body2') }}</p>
		<footer class="welcome__footer">
			<a
				class="welcome__github"
				href="https://github.com/manuelhintermayr/sketchbook-nuxt"
				target="_blank"
				rel="noopener"
			>GitHub page</a>
			<button
				type="button"
				class="welcome__confirm"
				@click="welcome.close()"
			>{{ t('world.welcome.button') }}</button>
		</footer>
	</BaseModal>
</template>

<style scoped>
.welcome__title
{
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h2);
	margin: 0 0 var(--space-4);
}

.welcome__body
{
	margin: 0 0 var(--space-3);
	color: var(--color-overlay-text);
	line-height: var(--leading-normal);
}

.welcome__footer
{
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-4);
	margin-top: var(--space-5);
	padding-top: var(--space-4);
	border-top: var(--border-width-sm) solid var(--color-overlay-choice-border);
}

.welcome__github
{
	color: var(--color-tertiary);
	text-decoration: underline;
	font-size: var(--text-body-sm);
}

.welcome__confirm
{
	all: unset;
	background: var(--color-primary);
	color: var(--color-on-primary);
	font-family: var(--font-label);
	font-weight: var(--weight-bold);
	padding: var(--space-3) var(--space-6);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-gold);
	cursor: pointer;
	transition: filter var(--motion-fast) var(--ease-default);
}

.welcome__confirm:hover
{
	filter: brightness(1.05);
}
</style>
