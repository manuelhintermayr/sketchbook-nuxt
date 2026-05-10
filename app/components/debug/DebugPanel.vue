<!--
  DebugPanel - composite Vue debug panel that replaces lil-gui.
  Reads + writes useEngineParams (Block 5/7) directly. Each engine
  subdomain's watch() handler picks up the changes; no controller
  cache, no onChange wiring, no save/load tree - the reactive object
  IS the source of truth, persisted by useEngineParams itself.

  Folder layout mirrors the original:
    - Map & Scenarios (Map dropdown + scenario buttons from useScenarios)
    - World (Time_Scale, Sun_*, Gravity, Free_Cam, Reset)
    - Vehicles (Friction_Slip, Suspension_*, Damping_*, Engine_Force)
    - Settings (FXAA, Shadows, Mouse_Sensitivity, Debug_*, audio toggles,
      Outlines, Labels, Dark_Mode)

  Block 14 (SettingsModal) reuses the same DebugSlider / DebugToggle /
  DebugSelect atoms - same source of truth, two surface views.
-->

<script setup lang="ts">
import { resetEngineParams } from '~/composables/useEngineParams'
import { useIris } from '~/composables/useIris'

const params = useEngineParams()
const { map: mapPref, darkMode, soundMuted } = useUserPrefs()
const { entries: scenarios } = useScenarios()
const { debugStack } = useHud()
const iris = useIris()

const MAP_OPTIONS = [
	{ value: 'inthenew',   label: 'Inthenew (v0.6, default)' },
	{ value: 'sw-v01',     label: 'swift502 v0.1 (foundation)' },
	{ value: 'sw-v02',     label: 'swift502 v0.2 (test world)' },
	{ value: 'sc-v03',     label: 'sketchbook v0.3 (socketControl)' },
	{ value: 'sc-v04',     label: 'sketchbook v0.4 (socketControl)' },
	{ value: 'sc-test',    label: 'test (socketControl sandbox)' },
	{ value: 'sc-test2',   label: 'test2 (socketControl sandbox)' },
	{ value: 'sc-test3',   label: 'test3 (socketControl sandbox)' },
	{ value: 'sc-example', label: 'example (socketControl sandbox)' },
]

const onMapChange = async (value: string): Promise<void> =>
{
	mapPref.value = value as any
	await iris.close()
	location.reload()
}

const resetWorldParams = (): void =>
{
	// Just the World folder's defaults. The full reset (every params
	// row + persisted prefs + localStorage) lives in the SettingsModal
	// Reset card (Block 14).
	resetEngineParams()
}

// Mirror Dark_Mode + Master_Audio writes back to the persisted user
// prefs so the title screen (next reload) sees the right state.
watch(() => params.Dark_Mode, (v) =>
{
	darkMode.value = v
	document.documentElement.classList.toggle('dark', v)
})
watch(() => params.Master_Audio, (v) => { soundMuted.value = !v })
</script>

<template>
	<aside v-show="debugStack" class="debug-panel">
		<DebugFolder title="Map & Scenarios" storage-key="map">
			<DebugSelect
				v-model="mapPref"
				label="Map"
				:options="MAP_OPTIONS"
				@update:model-value="onMapChange"
			/>
			<div v-if="scenarios.length > 0" class="debug-panel__scenarios">
				<DebugButton
					v-for="s in scenarios"
					:key="s.id"
					:label="s.name"
					@click="s.launch"
				/>
			</div>
		</DebugFolder>

		<DebugFolder title="World" storage-key="world">
			<DebugSlider v-model="params.Time_Scale"     label="Time Scale"    :min="0" :max="1"   :step="0.01" />
			<DebugSlider v-model="params.Sun_Elevation"  label="Sun Elevation" :min="0" :max="180" :step="1" />
			<DebugSlider v-model="params.Sun_Rotation"   label="Sun Rotation"  :min="0" :max="360" :step="1" />
			<DebugToggle v-model="params.Sun_Cycle"      label="Sun Cycle" />
			<DebugToggle v-model="params.Has_Night_Time" label="Has Night Time" :disabled="!params.Sun_Cycle" />
			<DebugSlider v-model="params.Gravity_Scale"  label="Gravity Scale" :min="0" :max="2"   :step="0.05" />
			<DebugSlider v-model="params.Free_Cam_Speed" label="Free Cam Speed" :min="1" :max="100" :step="1" />
			<DebugButton label="Reset" @click="resetWorldParams" />
		</DebugFolder>

		<DebugFolder title="Vehicles" storage-key="vehicles">
			<DebugSlider v-model="params.Friction_Slip"        label="Friction Slip"        :min="0" :max="5"   :step="0.05" />
			<DebugSlider v-model="params.Suspension_Stiffness" label="Suspension Stiffness" :min="0" :max="100" :step="1" />
			<DebugSlider v-model="params.Max_Suspension"       label="Max Suspension"       :min="0" :max="5"   :step="0.05" />
			<DebugSlider v-model="params.Damping_Compression"  label="Damping Compression"  :min="0" :max="10"  :step="0.1" />
			<DebugSlider v-model="params.Damping_Relaxation"   label="Damping Relaxation"   :min="0" :max="10"  :step="0.1" />
			<DebugSlider v-model="params.Engine_Force"         label="Engine Force"         :min="1" :max="50"  :step="1" />
		</DebugFolder>

		<DebugFolder title="Settings" storage-key="settings">
			<DebugToggle v-model="params.FXAA"             label="FXAA" />
			<DebugToggle v-model="params.Shadows"          label="Shadows" />
			<DebugSlider v-model="params.Mouse_Sensitivity" label="Mouse Sensitivity" :min="0" :max="1" :step="0.01" />
			<DebugToggle v-model="params.Debug_Physics"    label="Debug Physics" />
			<DebugToggle v-model="params.Debug_FPS"        label="Debug FPS" />
			<DebugToggle v-model="params.Camera_Shake"     label="Camera Shake" />
			<DebugToggle v-model="params.Master_Audio"     label="Master Audio" />
			<DebugToggle v-model="params.Sound_Effects"    label="Sound Effects" :disabled="!params.Master_Audio" />
			<DebugToggle v-model="params.Background_Music" label="Background Music" :disabled="!params.Master_Audio" />
			<DebugToggle v-model="params.Outlines"         label="Outlines" />
			<DebugToggle v-model="params.Labels"           label="Labels" />
			<DebugToggle v-model="params.Dark_Mode"        label="Dark Mode" />
		</DebugFolder>
	</aside>
</template>

<style scoped>
.debug-panel
{
	position: fixed;
	top: 80px;
	right: 0;
	width: 320px;
	max-height: calc(100vh - 100px);
	overflow-y: auto;
	background: var(--color-surface);
	color: var(--color-on-surface);
	border-left: var(--border-width-sm) solid var(--color-outline-variant);
	border-bottom: var(--border-width-sm) solid var(--color-outline-variant);
	z-index: var(--z-overlay);
	font-family: var(--font-label);
	box-shadow: var(--shadow-lg);
	pointer-events: auto;
}

.debug-panel__scenarios
{
	display: flex;
	flex-direction: column;
	gap: var(--space-1);
	margin-top: var(--space-2);
	padding-top: var(--space-2);
	border-top: var(--border-width-sm) solid var(--color-outline-variant);
}
</style>
