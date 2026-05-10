import { World } from '../World';

// Body-level DOM scaffolding the engine still needs:
//   - the canvas (THREE renderer)
//
// Everything else - fonts, loading screen, GitHub corner, controls
// overlay, planet menu, debug stack, UI container - moved to Vue
// components in Blocks 8-11. Stats.js still appends its own dom into
// the StatsBox.vue component's #debug-stack node from inside World.
export function bootstrapHTML(world: World): void
{
	document.body.appendChild(world.renderer.domElement);
	world.renderer.domElement.id = 'canvas';

	// Drop the canvas at world-dispose time so a remount doesn't leave
	// orphan canvases in body. The renderer.dispose() in World.dispose
	// already releases the WebGL context; this just frees the node.
	world.disposers.push(() =>
	{
		try { world.renderer.domElement.remove(); }
		catch (_e) { /* already detached */ }
	});
}
