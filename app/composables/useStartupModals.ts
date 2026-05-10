// Startup-time modals replacing the SweetAlert2 calls in the original
// engine: the welcome dialog after the loading screen finishes, the
// "Empty world" message when no scene path is supplied, and the WebGL
// 2 capability warning.
//
// Each modal exposes a Promise-returning open() so engine code can
// chain on user confirmation - mirrors the `Swal.fire(...).then(...)`
// pattern but routes through Vue components.

import { ref } from 'vue'

interface ModalState
{
	visible: ReturnType<typeof ref<boolean>>
	open: () => Promise<void>
	close: () => void
}

function createModal(): ModalState
{
	const visible = ref<boolean>(false)
	let resolver: (() => void) | null = null

	const open = (): Promise<void> => new Promise<void>((resolve) =>
	{
		resolver = resolve
		visible.value = true
	})

	const close = (): void =>
	{
		visible.value = false
		const r = resolver
		resolver = null
		r?.()
	}

	return { visible, open, close }
}

const welcome = createModal()
const empty = createModal()
const webgl = createModal()

// Per-scenario welcome dialog with dynamic content. Scenario.launch
// fills title + body before calling open(); the resolved promise lets
// the loading flow pick up after the player clicks Play.
const scenarioWelcomeTitle = ref<string>('')
const scenarioWelcomeBody = ref<string>('')
const scenarioWelcome = createModal()

function showScenarioWelcome(title: string, body: string): Promise<void>
{
	scenarioWelcomeTitle.value = title
	scenarioWelcomeBody.value = body
	return scenarioWelcome.open()
}

export function useStartupModals()
{
	return {
		welcome,
		empty,
		webgl,
		scenarioWelcome,
		scenarioWelcomeTitle,
		scenarioWelcomeBody,
		showScenarioWelcome,
	}
}
