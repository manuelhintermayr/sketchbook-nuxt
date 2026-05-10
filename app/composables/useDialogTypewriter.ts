// Typewriter animation. Pure function over the current node's text -
// runs an interval that increments the visible-character count, can
// be cancelled or skipped to the end. Extracted from DialogBox.vue
// so the typing logic is independently testable.

import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

const CHAR_DELAY_MS = 28

export function useDialogTypewriter(text: Ref<string>)
{
	const visible = ref<string>('')
	const isTyping = ref<boolean>(false)
	let timer: ReturnType<typeof setInterval> | null = null

	const stop = (): void =>
	{
		if (timer !== null) { clearInterval(timer); timer = null }
		isTyping.value = false
	}

	const finish = (): void =>
	{
		stop()
		visible.value = text.value
	}

	const start = (): void =>
	{
		stop()
		const full = text.value
		visible.value = ''
		isTyping.value = true
		let i = 0
		timer = setInterval(() =>
		{
			i++
			if (i >= full.length)
			{
				visible.value = full
				stop()
				return
			}
			visible.value = full.slice(0, i)
		}, CHAR_DELAY_MS)
	}

	// Restart on every text change. Caller controls when text changes
	// (typically when the active node changes).
	watch(text, () => start(), { immediate: true })

	onBeforeUnmount(stop)

	return { visible, isTyping, start, finish, stop }
}
