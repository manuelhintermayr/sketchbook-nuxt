<!--
  CubeLoader - the animated 3D cube ported 1:1 from cubeLoader.css.
  Used by LoadingScreen (Block 11) without the bouncy entry, and by
  TitleScreen (Block 16) wrapped in a continuous bounce animation.
  The `bouncy` prop opts into the entry animation; otherwise the
  cube just spins.

  All keyframes + 3D transforms are pure CSS (no canvas, no three.js
  needed for this little flourish), and the markup is the same flat
  div structure the original used so the styles transfer unchanged.
-->

<script setup lang="ts">
defineProps<{
	bouncy?: boolean
}>()
</script>

<template>
	<div class="cube-wrap" :class="{ 'cube-wrap--bouncy': bouncy }">
		<div class="cube">
			<div class="faces1"></div>
			<div class="faces2"></div>
		</div>
	</div>
</template>

<style scoped>
.cube-wrap
{
	perspective: 800px;
	width: 300px;
	overflow: hidden;
}

.cube-wrap--bouncy
{
	animation: bouncy 2s ease forwards;
}

.cube
{
	margin: 3em auto;
	width: 6em;
	height: 6em;
	transform-style: preserve-3d;
	transform-origin: 50% 50% -3em;
	position: relative;
	animation: spin 4s linear infinite;
	transform: rotateX(-50deg) rotateY(405deg);
}

.cube > div
{
	position: absolute;
	width: 6em;
	height: 6em;
	transform-style: preserve-3d;
}

.faces1::before,
.faces1::after,
.faces2::before,
.faces2::after
{
	position: absolute;
	content: '';
	display: block;
	width: 100%;
	height: 100%;
	transform-style: preserve-3d;
}

.faces1::before,
.faces2::before
{
	transform: rotateY(90deg);
	transform-origin: 0 50%;
}

.faces2
{
	transform: rotateX(180deg) translateZ(6em);
}

.faces2::before
{
	transform: rotateY(-90deg);
	transform-origin: 100% 50%;
}

.faces1::after,
.faces2::after
{
	transform: rotateX(-90deg);
	transform-origin: 50% 0;
}

.faces1 { background-color: #eee; }
.faces2 { background-color: #f3f3f3; }
.faces1::before { background-color: #f8f8f8; }
.faces2::before { background-color: white; }
.faces1::after { background-color: #e9e9e9; }
.faces2::after { background-color: #e4e4e4; }

@keyframes spin
{
	0%   { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
	100% { transform: rotateX(720deg) rotateY(360deg) rotateZ(0deg); }
}

@keyframes bouncy
{
	/* up */
	0%   { transform: translateY(-600px) scale(0.8, 1.2);  animation-timing-function: ease-in; }
	/* floor */
	30%  { transform: translateY(0) scale(0.8, 1.2);       animation-timing-function: ease-out; }
	32%  { transform: translateY(0) scale(1, 0.8);         animation-timing-function: ease-out; }
	/* up */
	45%  { transform: translateY(-100px) scale(0.9, 1.1);  animation-timing-function: ease-in; }
	60%  { transform: translateY(0) scale(0.9, 1.1);       animation-timing-function: ease-out; }
	62%  { transform: translateY(0) scale(1, 0.9);         animation-timing-function: ease-out; }
	/* up */
	70%  { transform: translateY(-30px) scale(0.9, 1.1);   animation-timing-function: ease-in; }
	80%  { transform: translateY(0) scale(1, 1);           animation-timing-function: ease-out; }
	82%  { transform: translateY(0) scale(1, 0.95);        animation-timing-function: ease-out; }
	/* up */
	85%  { transform: translateY(-10px) scale(0.98, 1.02); animation-timing-function: ease-in; }
	90%  { transform: translateY(0) scale(1, 1);           animation-timing-function: ease-out; }
}
</style>
