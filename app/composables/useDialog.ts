// Vue facade over engine/state/dialog. The reactive refs live in the
// engine module (so Engine code + the Vue UI both touch the same
// references); this composable just re-exports them in the standard
// `useX()` shape.

import {
	dialog,
	currentNodeId,
	isOpen,
	participants,
	openDialog,
	closeDialog,
	pickChoice,
} from '~~engine/state/dialog'

export type { Dialog, DialogNode, DialogChoice, DialogOpenOptions } from '~~engine/state/dialog'

export function useDialog()
{
	return {
		dialog,
		currentNodeId,
		participants,
		isOpen,
		open: openDialog,
		close: closeDialog,
		pickChoice,
	}
}
