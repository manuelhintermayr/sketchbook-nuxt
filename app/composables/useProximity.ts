// Proximity counters. Replaces the CustomEvent bus
// (proximity-near / proximity-far) that ProximityPrompt + TouchControls
// used to talk through.
//
// ProximityPrompt enters/leaves a near range -> increments / decrements
// the matching counter. TouchControls.vue (Block 12) reads the counts
// + nearVehicle to decide which on-screen buttons to show.

import { ref, computed } from 'vue'

const nearInteractCount = ref<number>(0)
const nearDialogCount = ref<number>(0)
const nearVehicle = ref<boolean>(false)

const isAnythingNear = computed(() =>
	nearInteractCount.value > 0 || nearDialogCount.value > 0 || nearVehicle.value)

function enterNear(kind: 'interact' | 'dialog'): void
{
	if (kind === 'interact') nearInteractCount.value++
	else nearDialogCount.value++
}

function exitNear(kind: 'interact' | 'dialog'): void
{
	if (kind === 'interact')
	{
		nearInteractCount.value = Math.max(0, nearInteractCount.value - 1)
	}
	else
	{
		nearDialogCount.value = Math.max(0, nearDialogCount.value - 1)
	}
}

export function useProximity()
{
	return { nearInteractCount, nearDialogCount, nearVehicle, isAnythingNear, enterNear, exitNear }
}
