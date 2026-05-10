// Asset-path helper. Every asset URL in the engine (GLBs, textures,
// audio loops, post-FX bakes) goes through asset() so the deployed
// SPA works behind a sub-path.
//
// At dev time `import.meta.env.BASE_URL` is `/` so asset('/foo') →
// '/foo'. At production build time it's whatever `nuxt.config.ts`'s
// `app.baseURL` resolves to (e.g. '/sketchbook-nuxt/'), so asset('/foo')
// → '/sketchbook-nuxt/foo'. Vite injects the value at compile time, so
// the engine code stays sub-path-agnostic.
//
// Use it for every absolute path the engine fetches at runtime.
// Author-supplied paths (e.g. Speaker.userData.audio inside a GLB)
// are passed through verbatim - the map author owns those.

const RAW_BASE: string =
	(typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || '/';

// Strip the trailing slash so concatenation with paths that already
// start with '/' produces exactly one separator.
export const BASE_URL: string = RAW_BASE.replace(/\/$/, '');

export function asset(path: string): string
{
	if (BASE_URL === '') return path;
	return BASE_URL + (path.startsWith('/') ? path : '/' + path);
}
