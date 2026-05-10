// Friendly error fallback. Replaces engine/world/ui/ErrorOverlay.ts.
// Listens for window.onerror + unhandledrejection (via vueuse's
// useEventListener so cleanup is automatic) and exposes a reactive
// payload the ErrorOverlay.vue component reads.

import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export interface ErrorPayload
{
	code: string
	title: string
	stack: string
}

const visible = ref<boolean>(false)
const payload = ref<ErrorPayload | null>(null)

let installed = false

function show(p: ErrorPayload): void
{
	// First error wins - cascades drown the original signal otherwise.
	if (visible.value) return
	payload.value = p
	visible.value = true
}

function dismiss(): void
{
	visible.value = false
	payload.value = null
}

export function useErrorOverlay()
{
	return { visible, payload, dismiss }
}

// Install once on first import. Static module-level guard means a
// second component mount doesn't double-attach the listeners.
export function installErrorOverlay(t: (key: string) => string): void
{
	if (installed || typeof window === 'undefined') return
	installed = true

	useEventListener(window, 'error', (e: ErrorEvent) =>
	{
		show({
			code: t('error.runtime'),
			title: e.message || t('error.fallbackUncaught'),
			stack: e.error?.stack || `${e.filename}:${e.lineno}:${e.colno}`,
		})
	})

	useEventListener(window, 'unhandledrejection', (e: PromiseRejectionEvent) =>
	{
		const reason = (e as any).reason
		show({
			code: t('error.unhandled'),
			title: typeof reason === 'string' ? reason : (reason?.message ?? t('error.fallbackRejection')),
			stack: reason?.stack || String(reason),
		})
	})
}
