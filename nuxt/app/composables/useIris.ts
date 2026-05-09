// Vue facade over engine/state/iris. The reactive ref + open/close
// promises live in the engine module so engine code can import them
// directly without depending on the Vue layer.

import { visible, openIris, closeIris } from '~~engine/state/iris'

export function useIris()
{
	return { visible, open: openIris, close: closeIris }
}
