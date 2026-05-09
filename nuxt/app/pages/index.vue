<!--
  Single page. Block 4+ replace this placeholder with <EngineHost />,
  the title screen, and all overlays. For Block 1+2 it just confirms
  the Nuxt dev server boots, the locale switch through useUserPrefs
  works, and the JSON translation files load.
-->
<script setup lang="ts">
const { t } = useI18n()
const { locale } = useUserPrefs()

const switchLocale = (next: 'en' | 'de' | 'es') =>
{
	locale.value = next
}
</script>

<template>
	<div class="boot-marker">
		<h1>{{ t('world.welcome.title') }}</h1>
		<p>{{ t('title.prompt') }}</p>
		<p class="lang-row">
			<button @click="switchLocale('en')">EN</button>
			<button @click="switchLocale('de')">DE</button>
			<button @click="switchLocale('es')">ES</button>
			<span class="active">active: {{ locale }}</span>
		</p>
	</div>
</template>

<style scoped>
.boot-marker
{
	position: fixed;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-family: var(--font-headline, serif);
	color: #fff;
	background: linear-gradient(to bottom, #568db5 0%, #ccdde8 100%);
	gap: 0.5rem;
}

.boot-marker h1
{
	font-size: 3rem;
	text-shadow: 1px 1px 1px #000, 0 1px 3px #000;
}

.boot-marker p
{
	opacity: 0.85;
}

.lang-row
{
	display: flex;
	gap: 0.5rem;
	align-items: center;
	margin-top: 1rem;
}

.lang-row button
{
	background: rgba(255, 255, 255, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.5);
	color: #fff;
	padding: 0.4rem 0.8rem;
	border-radius: 4px;
	cursor: pointer;
}

.active
{
	font-family: monospace;
	opacity: 0.7;
}
</style>
