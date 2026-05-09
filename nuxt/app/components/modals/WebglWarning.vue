<!--
  WebglWarning - WebGL 2 capability check fallback. Replaces
  the SweetAlert2 warning that World fired when
  WebGL.isWebGL2Available() returned false.
-->

<script setup lang="ts">
const { t } = useI18n()
const { webgl } = useStartupModals()
</script>

<template>
	<BaseModal
		id="webgl"
		:visible="webgl.visible.value"
		:dismissible="false"
	>
		<div class="webgl__icon" aria-hidden="true">⚠</div>
		<h2 class="webgl__title">{{ t('world.webgl.title') }}</h2>
		<p class="webgl__body">{{ t('world.webgl.body') }}</p>
		<p class="webgl__footer">
			<a
				href="https://get.webgl.org/"
				target="_blank"
				rel="noopener"
			>{{ t('world.webgl.footer') }}</a>
		</p>
	</BaseModal>
</template>

<style scoped>
.webgl__icon
{
	font-size: var(--text-display);
	color: var(--color-warning);
	text-align: center;
	margin-bottom: var(--space-3);
}

.webgl__title
{
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h3);
	margin: 0 0 var(--space-3);
	text-align: center;
}

.webgl__body
{
	margin: 0 0 var(--space-3);
	line-height: var(--leading-normal);
	text-align: center;
}

.webgl__footer
{
	margin: 0;
	text-align: center;
	font-size: var(--text-body-sm);
}

.webgl__footer a
{
	color: var(--color-tertiary);
	text-decoration: underline;
}
</style>
