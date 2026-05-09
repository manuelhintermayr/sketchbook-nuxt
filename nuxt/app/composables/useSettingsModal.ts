// Settings modal visibility. Opened from the PauseMenu's Settings
// button. Module-level singleton so the SettingsModal component +
// EngineHost reach the same ref.

import { ref } from 'vue'

const visible = ref<boolean>(false)

function open(): void  { visible.value = true }
function close(): void { visible.value = false }

export function useSettingsModal()
{
	return { visible, open, close }
}
