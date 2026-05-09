<!--
  LoadingScreen - blue-to-light gradient + cube + progress bar.
  Replaces the engine HTMLBootstrap loading-screen block. Driven by
  useLoadingState (set from LoadingManager via the engine state
  bridge - Block 6).
-->

<script setup lang="ts">
const { visible, progress, message } = useLoadingState()
const { t } = useI18n()

const text = computed(() => message.value !== '' ? message.value : t('world.loading'))
const percent = computed(() => Math.floor(progress.value))
</script>

<template>
	<Transition name="loading-fade">
		<div v-if="visible" class="loading-screen">
			<div class="loading-screen__bg" />
			<h1 class="loading-screen__title sb-font">Sketchbook 0.8.0</h1>
			<CubeLoader />
			<div class="loading-screen__percent">{{ percent }}%</div>
			<div class="loading-screen__track">
				<div class="loading-screen__fill" :style="{ width: `${progress}%` }" />
			</div>
			<div class="loading-screen__text">{{ text }}</div>
		</div>
	</Transition>
</template>

<style scoped>
.loading-screen
{
	position: fixed;
	inset: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	text-align: center;
	z-index: var(--z-modal);
	color: #fff;
}

.loading-screen__bg
{
	position: absolute;
	inset: 0;
	z-index: -1;
	background: linear-gradient(to bottom, var(--color-loading-top) 0%, var(--color-loading-bottom) 100%);
}

.loading-screen__title
{
	font-family: var(--font-display-alt);
	font-size: var(--text-display);
	color: #fff;
	text-shadow: var(--text-shadow-overlay);
	margin-bottom: 0;
}

.loading-screen__percent
{
	font-family: var(--font-mono);
	font-size: var(--text-h3);
	color: #fff;
	text-shadow: var(--text-shadow-overlay);
	margin-top: var(--space-4);
}

.loading-screen__track
{
	width: 300px;
	height: 6px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: var(--radius-pill);
	margin-top: var(--space-3);
	overflow: hidden;
}

.loading-screen__fill
{
	height: 100%;
	width: 0;
	background: #fff;
	border-radius: var(--radius-pill);
	transition: width var(--motion-fast) var(--ease-default);
}

.loading-screen__text
{
	font-size: var(--text-body-lg);
	margin-top: var(--space-2);
	color: rgba(255, 255, 255, 0.85);
}

.loading-fade-leave-active
{
	transition: opacity var(--motion-slow) var(--ease-default);
}
.loading-fade-leave-to
{
	opacity: 0;
}
</style>
