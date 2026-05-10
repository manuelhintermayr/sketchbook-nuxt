<!--
  PlanetMenu - Earth / Moon picker that the rocketship's apogee
  routine flips visible. Replaces the engine's HTMLBootstrap
  #planet-menu div + the document.getElementById('earth/moon') click
  binding inside RocketShip. The click flow now goes through
  useScenarioState.selectPlanet, which dispatches to whichever rocket
  registered itself via setPlanetSelect.
-->

<script setup lang="ts">
import { asset } from '~~engine/core/AssetPath'

const { planetMenuOpen, selectPlanet } = useScenarioState()
const { t } = useI18n()

// Static <img src="..."> hrefs aren't prefixed by Nuxt's baseURL -
// route them through asset() so the planet thumbnails resolve under
// the deploy sub-path (e.g. /sketchbook-nuxt/img/...).
const earthSrc = asset('/img/hemisphere-earth.png')
const moonSrc = asset('/img/full-moon.png')
</script>

<template>
	<div v-if="planetMenuOpen" class="planet-menu">
		<h1 class="planet-menu__heading">{{ t('world.planet.heading') }}</h1>
		<button
			type="button"
			class="planet-menu__item"
			@click="selectPlanet('earth')"
		>
			<img :src="earthSrc" :alt="t('world.planet.earth')">
			<p>{{ t('world.planet.earth') }}</p>
		</button>
		<button
			type="button"
			class="planet-menu__item"
			@click="selectPlanet('moon')"
		>
			<img :src="moonSrc" :alt="t('world.planet.moon')">
			<p>{{ t('world.planet.moon') }}</p>
		</button>
	</div>
</template>

<style scoped>
.planet-menu
{
	position: fixed;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--space-8);
	background: rgba(0, 0, 0, 0.65);
	z-index: var(--z-modal);
	pointer-events: auto;
}

.planet-menu__heading
{
	color: #fff;
	font-size: var(--text-h2);
	margin: 0;
	text-align: center;
	font-family: var(--font-display-alt);
}

.planet-menu__item
{
	all: unset;
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
	padding: var(--space-4);
	border-radius: var(--radius-xl);
	background: rgba(255, 255, 255, 0.08);
	transition: background var(--motion-fast) var(--ease-default), transform var(--motion-fast) var(--ease-default);
}

.planet-menu__item:hover
{
	background: rgba(255, 255, 255, 0.18);
	transform: scale(1.05);
}

.planet-menu__item img
{
	width: 200px;
	height: 200px;
	border-radius: var(--radius-full);
	object-fit: cover;
}

.planet-menu__item p
{
	color: #fff;
	font-size: var(--text-h4);
	margin: var(--space-3) 0 0 0;
	font-family: var(--font-body);
}

@media (min-width: 600px)
{
	.planet-menu
	{
		flex-direction: row;
	}
	.planet-menu__heading
	{
		position: absolute;
		top: 8%;
	}
}
</style>
