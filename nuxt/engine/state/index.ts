// Engine state bridge.
//
// Counterpart to engine/i18n: a thin injection point that lets engine
// classes write into the Nuxt state composables without importing Vue.
// The EngineHost component calls bindEngineState() once in onMounted
// with refs from useLoadingState / useHud / useRaceState /
// useScenarioState.
//
// Until bound, the setters are no-ops - the engine still functions, it
// just doesn't propagate state into the Vue layer (handy for unit
// tests or pre-mount races).

export interface EngineStateBinding
{
	loading:
	{
		setVisible: (v: boolean) => void
		setProgress: (p: number) => void
		setMessage: (m: string) => void
	}
	hud:
	{
		setUiContainer: (v: boolean) => void
		setControlsOverlay: (v: boolean) => void
		setFps: (v: boolean) => void
		setDebugStack: (v: boolean) => void
		toggleControlsOverlay: () => void
	}
	race:
	{
		setLap: (lap: number | null) => void
	}
	scenario:
	{
		setOnMoon: (v: boolean) => void
		setPlanetMenuOpen: (v: boolean) => void
		setActiveScenarioId: (id: string | null) => void
	}
	scenarios:
	{
		register: (entry: { id: string, name: string, launch: () => void }) => void
		clear: () => void
	}
}

const NO_OP_BINDING: EngineStateBinding =
{
	loading:
	{
		setVisible: () => {},
		setProgress: () => {},
		setMessage: () => {},
	},
	hud:
	{
		setUiContainer: () => {},
		setControlsOverlay: () => {},
		setFps: () => {},
		setDebugStack: () => {},
		toggleControlsOverlay: () => {},
	},
	race:
	{
		setLap: () => {},
	},
	scenario:
	{
		setOnMoon: () => {},
		setPlanetMenuOpen: () => {},
		setActiveScenarioId: () => {},
	},
	scenarios:
	{
		register: () => {},
		clear: () => {},
	},
}

let _binding: EngineStateBinding = NO_OP_BINDING

export function bindEngineState(impl: EngineStateBinding): void
{
	_binding = impl
}

export function unbindEngineState(): void
{
	_binding = NO_OP_BINDING
}

// Getters - call sites read like `engineState().loading.setProgress(p)`,
// staying readable without leaking the binding's identity through the
// engine's import surface.
export function engineState(): EngineStateBinding
{
	return _binding
}
