// Single source of truth for every tunable engine parameter.
//
// Replaces:
//   - the original engine's `world.params` plain object
//   - the lil-gui controller registry that backed it
//   - the manual SettingsModal <-> lil-gui sync bridge
//
// Engine subdomains (Sky, Vehicle, Audio, Renderer, ...) read this
// object directly and register their own watch() handlers in their
// constructors (Block 6) - the state composable itself never imports
// engine code, keeping the dependency arrow pointing one way.
//
// Persistence: all values mirror into localStorage under the same key
// the original lil-gui used (`sketchbook-settings`), so an upgraded
// user's saved tuning survives the migration.

import { reactive, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export interface EngineParams
{
	// Camera + general
	Mouse_Sensitivity: number
	Time_Scale: number
	Free_Cam_Speed: number
	Gravity_Scale: number

	// Graphics
	Shadows: boolean
	FXAA: boolean
	Outlines: boolean
	Labels: boolean
	Camera_Shake: boolean

	// Sky / day-night
	Sun_Elevation: number
	Sun_Rotation: number
	Sun_Cycle: boolean
	Has_Night_Time: boolean

	// Audio mix
	Master_Audio: boolean
	Master_Volume: number
	Music_Volume: number
	SFX_Volume: number
	Sound_Effects: boolean
	Background_Music: boolean

	// Vehicle tuning
	Friction_Slip: number
	Suspension_Stiffness: number
	Max_Suspension: number
	Damping_Compression: number
	Damping_Relaxation: number
	Engine_Force: number

	// Debug
	Debug_FPS: boolean
	Debug_Physics: boolean

	// Theme - mirrors useUserPrefs.darkMode (kept here too because the
	// original engine's params object exposed it and the SettingsModal
	// row binds against this shape).
	Dark_Mode: boolean
}

const DEFAULTS: EngineParams =
{
	Mouse_Sensitivity: 0.3,
	Time_Scale: 1,
	Free_Cam_Speed: 25,
	Gravity_Scale: 1,

	Shadows: true,
	FXAA: true,
	Outlines: false,
	Labels: true,
	Camera_Shake: true,

	Sun_Elevation: 50,
	Sun_Rotation: 145,
	Sun_Cycle: false,
	Has_Night_Time: false,

	Master_Audio: true,
	Master_Volume: 80,
	Music_Volume: 60,
	SFX_Volume: 75,
	Sound_Effects: true,
	Background_Music: true,

	Friction_Slip: 0.8,
	Suspension_Stiffness: 20,
	Max_Suspension: 1,
	Damping_Compression: 2,
	Damping_Relaxation: 2,
	Engine_Force: 10,

	Debug_FPS: true,
	Debug_Physics: false,

	Dark_Mode: false,
}

const STORAGE_KEY = 'sketchbook-settings'

// Module-level singleton. Loading from localStorage at module load
// matches the original engine's eager-restore behaviour - by the time
// any component or engine subsystem reads from `params`, the persisted
// values are already in place.
const params = reactive<EngineParams>({ ...DEFAULTS })

// Hydrate from localStorage on the client. The original engine stored
// `gui.save()` output (a {folders, controllers} tree); we now persist
// the flat params object directly so a future debug panel reads the
// same shape and there is no shape-drift between formats. Old saves
// from the lil-gui era are quietly discarded - users get the defaults
// back exactly once.
if (typeof window !== 'undefined')
{
	try
	{
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (raw !== null)
		{
			const parsed = JSON.parse(raw)
			// Only copy keys we know about - reject anything else so a
			// stale or malicious payload can't inject random properties.
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
			{
				for (const key of Object.keys(DEFAULTS) as Array<keyof EngineParams>)
				{
					if (key in parsed) (params as any)[key] = parsed[key]
				}
			}
		}
	}
	catch (_e) { /* corrupted JSON - fall back to defaults */ }

	// Persist on every change. JSON.stringify on a reactive proxy reads
	// each key once - cheap relative to a 60Hz render loop touching the
	// same object. deep:true so nested mutations (none today, but cheap
	// to keep correct) flush too.
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

export function resetEngineParams(): void
{
	for (const key of Object.keys(DEFAULTS) as Array<keyof EngineParams>)
	{
		(params as any)[key] = DEFAULTS[key]
	}
}
