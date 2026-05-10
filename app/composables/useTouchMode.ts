// Touch-mode flag. Mirrors the html.touch-active class the original
// engine maintained, but as a reactive ref so components can react
// without a MutationObserver.

import { ref, watch } from 'vue'

const active = ref<boolean>(false)

if (typeof document !== 'undefined')
{
	watch(active, (on) => document.documentElement.classList.toggle('touch-active', on))
}

function enter(): void
{
	if (!active.value) active.value = true
}

function exit(): void
{
	if (active.value) active.value = false
}

export function useTouchMode()
{
	return { active, enter, exit }
}
