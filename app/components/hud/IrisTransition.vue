<!--
  IrisTransition - circular black wipe driven by useIris().
  Replaces engine/world/ui/IrisTransition.ts. Pure CSS clip-path
  animation; the composable's open() / close() promises just toggle
  the visible flag and resolve after the transition duration.
-->

<script setup lang="ts">
const { visible } = useIris()
</script>

<template>
	<div class="iris" :class="{ 'iris--visible': visible }" />
</template>

<style scoped>
.iris
{
	position: fixed;
	inset: 0;
	background-color: #000;
	clip-path: circle(0% at 50% 50%);
	transition: clip-path 700ms cubic-bezier(0.76, 0, 0.24, 1);
	pointer-events: none;
	z-index: var(--z-modal);
	will-change: clip-path;
}

.iris--visible
{
	clip-path: circle(150% at 50% 50%);
	pointer-events: auto;
}
</style>
