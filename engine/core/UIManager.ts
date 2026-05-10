// Bridge between engine code and the Nuxt state composables. The
// legacy DOM mutations (loading-screen / ui-container / statsBox /
// loading-bar-fill) are gone since Block 11 - those nodes are Vue
// components now. Engine code still reaches the same surfaces by
// writing through these setters, which fan out into useLoadingState /
// useHud and let the Vue layer handle the actual rendering.

import { engineState } from '../state'

export class UIManager
{
	public static setUserInterfaceVisible(value: boolean): void
	{
		engineState().hud.setUiContainer(value)
	}

	public static setLoadingScreenVisible(value: boolean): void
	{
		engineState().loading.setVisible(value)
	}

	public static setFPSVisible(value: boolean): void
	{
		engineState().hud.setFps(value)
	}

	public static setLoadingProgress(percent: number): void
	{
		const v = Math.max(0, Math.min(100, percent))
		engineState().loading.setProgress(v)
	}
}
