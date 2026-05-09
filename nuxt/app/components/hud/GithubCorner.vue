<!--
  GithubCorner - the top-left "Fork me on GitHub" SVG. Pure decoration,
  links to the project's repo. Replaces the same SVG injected by
  HTMLBootstrap.
-->

<template>
	<a
		class="github-corner"
		href="https://github.com/manuelhintermayr/sketchbook-upgraded"
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
</template>

<style scoped>
.github-corner
{
	position: fixed;
	top: 0;
	left: 0;
	width: 60px;
	height: 60px;
	color: var(--color-secondary);
	z-index: var(--z-overlay);
	pointer-events: auto;
}

.github-corner svg
{
	width: 100%;
	height: 100%;
	transition: filter var(--motion-fast) var(--ease-default);
}

.github-corner:hover svg
{
	filter: brightness(1.2);
}
</style>
