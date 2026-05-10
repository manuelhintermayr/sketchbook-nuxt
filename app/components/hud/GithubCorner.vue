<!--
  GithubCorner - the top-left "Fork me on GitHub" SVG.
  The original visual trick: a 120x120 clipping container with the
  100x100 SVG rotated -45 deg and recentered, so only the diagonal
  corner peeks out as a banner. The flat 60x60 box (without rotate)
  was leaving a square edge along the top of the screen.
-->

<template>
	<div class="github-corner">
		<a
			class="github-corner__link"
			href="https://github.com/manuelhintermayr/sketchbook-nuxt"
			target="_blank"
			rel="noopener"
			title="Fork me on GitHub"
		>
			<svg viewBox="0 0 100 100" fill="currentColor">
				<title>Fork me on GitHub</title>
				<path d="M0 0v100h100V0H0zm60 70.2h.2c1 2.7.3 4.7 0 5.2 1.4 1.4 2 3 2 5.2 0 7.4-4.4 9-8.7 9.5.7.7 1.3 2
					1.3 3.7V99c0 .5 1.4 1 1.4 1H44s1.2-.5 1.2-1v-3.8c-3.5 1.4-5.2-.8-5.2-.8-1.5-2-3-2-3-2-2-.5-.2-1-.2-1
					2-.7 3.5.8 3.5.8 2 1.7 4 1 5 .3.2-1.2.7-2 1.2-2.4-4.3-.4-8.8-2-8.8-9.4 0-2 .7-4 2-5.2-.2-.5-1-2.5.2-5
					0 0 1.5-.6 5.2 1.8 1.5-.4 3.2-.6 4.8-.6 1.6 0 3.3.2 4.8.7 2.8-2 4.4-2 5-2z" />
			</svg>
		</a>
	</div>
</template>

<style scoped>
.github-corner
{
	position: fixed;
	top: 0;
	left: 0;
	width: 120px;
	height: 120px;
	overflow: hidden;
	z-index: var(--z-overlay);
	pointer-events: auto;
}

.github-corner__link
{
	position: absolute;
	right: 0;
	top: 0;
	left: 0;
	bottom: 0;
	color: var(--color-secondary);
	transform: translate(-50%, -50%) rotate(-45deg);
	transition: filter var(--motion-fast) var(--ease-default);
}

.github-corner__link svg
{
	width: 100%;
	height: 100%;
	display: block;
}

.github-corner__link:hover
{
	filter: brightness(1.2);
}
</style>
