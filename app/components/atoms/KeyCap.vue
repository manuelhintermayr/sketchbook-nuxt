<!--
  KeyCap - keyboard-key chrome (the "WASD" / "Esc" / "F" pills).
  Reused by ControlsOverlay (Block 11), PauseMenu hint (Block 13),
  TitleScreen prompt (Block 16) and DialogBox choices (Block 15).

  Slot lets the caller put custom content (a number, an arrow glyph,
  multiple chars), so the atom doesn't dictate the label format.
-->

<template>
	<kbd class="key-cap">
		<slot />
	</kbd>
</template>

<style scoped>
.key-cap
{
	display: inline-block;
	font-family: var(--font-mono);
	font-weight: var(--weight-bold);
	font-size: var(--text-body-sm);
	padding: 2px 8px;
	margin: 0 2px;
	min-width: 10px;
	text-align: center;
	background: #eff0f2;
	color: #111111;
	border-radius: var(--radius-sm);
	box-shadow: var(--shadow-keycap);
	text-shadow: none;
}
</style>
