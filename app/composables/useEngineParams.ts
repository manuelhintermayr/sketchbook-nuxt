// Single source of truth for every tunable engine parameter.
//
// The reactive object itself lives in `engine/state/params.ts` so the
// engine subdomains (Sky, CameraOperator, Vehicle, Audio, Renderer,
// OutlineEffect, ...) can `import { params } from '~~engine/state/params'`
// + register their own watch() handlers without importing app-side
// composables. Vue components read the identical reference through
// this composable.
//
// Persistence lives here on the Vue side because writing to
// localStorage from inside engine code would couple the engine to a
// browser-specific API. The watch() runs on the same shared object,
// so any engine-side mutation flushes to storage too.

import { watch } from 'vue'
import { params, resetParams, type EngineParams } from '~~engine/state/params'

const STORAGE_KEY = 'sketchbook-settings'

if (typeof window !== 'undefined')
{
	// Hydrate from localStorage on first import. Earlier saves from the
	// lil-gui era are quietly ignored - the previous shape (folder
	// tree) doesn't match this flat shape.
	try
	{
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (raw !== null)
		{
			const parsed = JSON.parse(raw)
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
			{
				for (const key of Object.keys(params) as Array<keyof EngineParams>)
				{
					if (key in parsed) (params as any)[key] = parsed[key]
				}
			}
		}
	}
	catch (_e) { /* corrupted JSON - fall back to defaults */ }

	// Persist on change. deep:true so any nested object property a
	// future param adds (none today) flushes too.
	watch(params, () =>
	{
		try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(params)) }
		catch (_e) { /* localStorage full / disabled */ }
	}, { deep: true })
}

export function useEngineParams(): EngineParams
{
	return params
}

export { resetParams as resetEngineParams }
export type { EngineParams }
