// The reactive params singleton shared between the Vue layer
// (useEngineParams) and the engine subdomains that watch() against it.
//
// Lives in `engine/` because the engine is the heavier consumer:
// every subsystem that historically read `world.params.X` reads the
// same object now. The composable in `app/composables/useEngineParams.ts`
// re-exports this so the Vue side gets the identical reference - one
// reactive object, two import paths, no drift possible.
//
// Vue's `reactive()` works standalone (it's just a Proxy + dep tracker),
// so importing from `vue` here doesn't drag the framework into engine
// code - only the reactivity primitive, which is a sub-100 LOC slice.

import { reactive } from 'vue'

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

	// Theme
	Dark_Mode: boolean
}

export const DEFAULT_PARAMS: EngineParams =
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

// Module-level singleton. lil-gui's gui.add(target, key) walks this
// proxy via property access, which Vue's reactive supports directly.
export const params: EngineParams = reactive<EngineParams>({ ...DEFAULT_PARAMS })

export function resetParams(): void
{
	for (const key of Object.keys(DEFAULT_PARAMS) as Array<keyof EngineParams>)
	{
		(params as any)[key] = DEFAULT_PARAMS[key]
	}
}
