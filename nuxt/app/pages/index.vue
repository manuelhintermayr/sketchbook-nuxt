<!--
  Single page. Block 4+ replace this placeholder with <EngineHost />,
  the title screen, and all overlays. For Block 1 it just confirms the
  Nuxt dev server boots and renders.
-->
<template>
	<div class="boot-marker">
		<h1>Sketchbook (Nuxt port)</h1>
		<p>Block 1 skeleton up. Engine and UI follow.</p>
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
}

.boot-marker h1
{
	font-size: 3rem;
	margin-bottom: 0.5rem;
	text-shadow: 1px 1px 1px #000, 0 1px 3px #000;
}

.boot-marker p
{
	opacity: 0.85;
}
</style>
