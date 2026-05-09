<!--
  StatsBox - mount container for stats.js. The engine creates the
  Stats() instance + appends its dom inside World; this component
  exposes a div with id="debug-stack" so the engine's
  `document.getElementById('debug-stack').appendChild(stats.dom)` call
  finds the right node regardless of mount order.

  Visibility is driven by useHud().fps (toggled from the SettingsModal
  Debug_FPS row in Block 14). The engine's UIManager.setFPSVisible
  also keeps the legacy CSS display flip running until then.
-->

<script setup lang="ts">
const { fps } = useHud()
</script>

<template>
	<div id="debug-stack" class="stats-box" :class="{ 'stats-box--hidden': !fps }">
		<!-- stats.js dom + legacy lil-gui (until Block 10 removed it)
		     used to live here side by side. Today only stats.js mounts;
		     the DebugPanel sits in its own component now. -->
	</div>
</template>

<style scoped>
.stats-box
{
	position: fixed;
	top: 0;
	right: 0;
	z-index: var(--z-stats);
	display: flex;
	flex-direction: column;
	pointer-events: auto;
}

.stats-box--hidden
{
	display: none;
}
</style>
