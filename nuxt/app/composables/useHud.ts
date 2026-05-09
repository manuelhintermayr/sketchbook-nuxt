// HUD-visibility flags. Replaces UIManager.setUserInterfaceVisible /
// setFPSVisible + the imperative `style.display = 'none'` toggles
// scattered across the engine.
//
// Each flag is a Vue ref read by the matching shell component (Block
// 7) and toggled from any engine code that needs to (e.g. World hides
// the UI while the loading screen is visible, then shows it once the
// welcome dialog is dismissed).

import { ref } from 'vue'

const uiContainer = ref<boolean>(false)
const controlsOverlay = ref<boolean>(true)
const fps = ref<boolean>(false)
const debugStack = ref<boolean>(true)

export function useHud()
{
	return { uiContainer, controlsOverlay, fps, debugStack }
}
