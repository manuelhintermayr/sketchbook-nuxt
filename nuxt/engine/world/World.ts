import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { watch } from 'vue';

import { CameraOperator } from '../core/CameraOperator';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';

import Stats from 'stats.js';
import CannonDebugger from 'cannon-es-debugger';
import * as _ from 'lodash-es';

import { InputManager } from '../core/InputManager';
import { LoadingManager } from '../core/LoadingManager';
import { InfoStack } from '../core/InfoStack';
import { UIManager } from '../core/UIManager';
import { CameraShake } from '../core/CameraShake';
import type { IWorldEntity } from '../interfaces/IWorldEntity';
import type { IUpdatable } from '../interfaces/IUpdatable';
import { Character } from '../characters/Character';
import { Path } from './scenarios/Path';
import { Vehicle } from '../vehicles/Vehicle';
import { Helicopter } from '../vehicles/Helicopter';
import { Airplane } from '../vehicles/Airplane';
import { Car } from '../vehicles/Car';
import { Boat } from '../vehicles/Boat';
import { RocketShip } from '../vehicles/RocketShip';
import { Scenario } from './scenarios/Scenario';
import { Sky } from './Sky';
import { Ocean } from './Ocean';
// PauseMenu + SettingsModal moved to Vue (Blocks 13-14); engine no
// longer instantiates them - the components live in app/components/
// modals/ and pull state through composables + the state bridge.
import { t } from '../i18n';
import { IrisTransition } from './ui/IrisTransition';
import { OutlineEffect } from './OutlineEffect';
import { AmbientSound } from './audio/AmbientSound';
import { BackgroundMusic } from './audio/BackgroundMusic';
import { SfxBus } from './audio/SfxBus';
import { engineState } from '../state';
import { bindDialogSfxBus } from '../state/dialog';
import { bootstrapHTML } from './setup/HTMLBootstrap';
import { setupRendererPipeline, tickRenderPipeline, tickCannonDebug } from './setup/RendererPipeline';
import { params as sharedParams } from '../state/params';
import { wireV02GameMode } from './setup/v02GameMode';
import { loadScene } from './loading/SceneLoader';
import { WorldLabels } from './ui/WorldLabels';

export class World
{
	public renderer: THREE.WebGLRenderer;
	public labelRenderer: CSS2DRenderer;
	public camera: THREE.PerspectiveCamera;
	public composer: any;
	public stats: Stats;
	public graphicsWorld: THREE.Scene;
	public sky: Sky;
	public physicsWorld: CANNON.World;
	public parallelPairs: any[];
	public physicsFrameRate: number;
	public physicsFrameTime: number;
	public physicsMaxPrediction: number;
	public renderDelta: number;
	public logicDelta: number;
	public requestDelta: number;
	private stopwatchLastTime: number = performance.now();
	public sinceLastFrame: number;
	public justRendered: boolean;
	public params: any;
	public inputManager: InputManager;
	public cameraOperator: CameraOperator;
	public timeScaleTarget: number = 1;

	// Lifecycle bookkeeping for World.dispose() - called when the
	// EngineHost component unmounts (HMR during dev, route change in
	// future). The render loop checks `disposed` before scheduling the
	// next RAF; the disposers array runs in reverse order to undo each
	// add-listener / append-DOM / new-AudioContext side effect that
	// constructors registered.
	private disposed: boolean = false;
	private rafHandle: number | null = null;
	public disposers: Array<() => void> = [];
	public console: InfoStack;
	public cannonDebugRenderer: ReturnType<typeof CannonDebugger> | undefined;
	public cannonDebugMeshes: THREE.Mesh[] = [];
	public scenarios: Scenario[] = [];
	public characters: Character[] = [];
	public vehicles: Vehicle[] = [];
	public cars: Car[] = [];
	public helicopters: Helicopter[] = [];
	public airplanes: Airplane[] = [];
	public ocean: Ocean | null = null;
	public paths: Path[] = [];

	// onMoon is read every physics step (updatePhysics gravity branch),
	// so the underlying field must stay a plain boolean - reactive
	// reads in a 60Hz loop add up. The setter mirrors the change into
	// useScenarioState so Vue components (Sky, PlanetMenu, etc.) react
	// without polling.
	private _onMoon: boolean = false;
	public get onMoon(): boolean { return this._onMoon; }
	public set onMoon(value: boolean)
	{
		this._onMoon = value;
		engineState().scenario.setOnMoon(value);
	}

	// scenarioGUIFolder / scenarioListFolder were lil-gui handles. They
	// disappeared in Block 10 - scenario launch buttons are now rendered
	// from useScenarios() inside DebugPanel.vue.
	public updatables: IUpdatable[] = [];

	public audioListener: THREE.AudioListener | null = null;
	public cameraShake: CameraShake;
	public outlineEffect: OutlineEffect;
	public ambientSound: AmbientSound;
	public backgroundMusic: BackgroundMusic;
	public sfxBus: SfxBus;
	public worldLabels: WorldLabels;

	// Same reactive-mirror pattern as onMoon. lastScenarioID is read
	// from restartScenario() and written from launchScenario(). The
	// setter pushes the new id into useScenarioState so the pause menu's
	// Restart button can show / hide based on whether anything has been
	// launched.
	private _lastScenarioID: string | undefined;
	private get lastScenarioID(): string | undefined { return this._lastScenarioID; }
	private set lastScenarioID(value: string | undefined)
	{
		this._lastScenarioID = value;
		engineState().scenario.setActiveScenarioId(value ?? null);
	}

	constructor(worldScenePath?: any)
	{
		const scope = this;

		// WebGL 2 not supported - hand off to the WebglWarning Vue
		// component (Block 12). The original engine fired SweetAlert2
		// here; we now route through the state bridge.
		if (!WebGL.isWebGL2Available())
		{
			engineState().startupModals.showWebglWarning();
		}

		setupRendererPipeline(this);

		bootstrapHTML(this);

		// LapCounter is now LapCounter.vue (Block 11) reading useRaceState.

		// Z toggles the controls overlay (ported from Inthenew). Listened
		// at document level so it works whichever input receiver is
		// active - character, vehicle, or free camera. Stored bound
		// handler + disposer so World.dispose() can drop the listener
		// when the component unmounts.
		const onKeyZ = (e: KeyboardEvent): void =>
		{
			if (e.code === 'KeyZ' && !e.repeat) this.toggleControlsOverlay();
		};
		document.addEventListener('keydown', onKeyZ);
		this.disposers.push(() => document.removeEventListener('keydown', onKeyZ));

		// Physics
		this.physicsWorld = new CANNON.World();
		this.physicsWorld.gravity.set(0, -9.81, 0);
		this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
		//this.physicsWorld.solver.iterations = 10; NOW DEFAULT for GSSolver
		this.physicsWorld.allowSleep = true;

		this.parallelPairs = [];
		this.physicsFrameRate = 60;
		this.physicsFrameTime = 1 / this.physicsFrameRate;
		this.physicsMaxPrediction = this.physicsFrameRate;

		// RenderLoop
		this.stopwatchLastTime = performance.now();
		this.renderDelta = 0;
		this.logicDelta = 0;
		this.sinceLastFrame = 0;
		this.justRendered = false;

		// Stats (FPS, Frame time, Memory). Upstream stats.js shows one panel
		// at a time and toggles on click; Sketchbook historically rendered
		// FPS + MS + MB side-by-side inside the UI container, hidden by
		// default until the Debug_FPS toggle is flipped. Replicate that.
		this.stats = new Stats();
		this.stats.dom.id = 'statsBox';
		this.stats.dom.style.display = 'none';
		// stats.js sets inline `position: fixed; top: 0; left: 0` on
		// the dom element. Inside the debug-stack flex column we want
		// it in the normal flow - strip those so CSS class selectors
		// take over.
		this.stats.dom.style.position = 'static';
		this.stats.dom.style.top = '';
		this.stats.dom.style.left = '';
		// Stats DOM mounts inside the StatsBox.vue component (Block 10);
		// during the migration the legacy #debug-stack container also
		// exists (HTMLBootstrap), so we keep appending to it as a
		// fallback. StatsBox.vue picks the same node up via id.
		const debugStack = document.getElementById('debug-stack');
		if (debugStack) debugStack.appendChild(this.stats.dom);
		for (const panel of Array.from(this.stats.dom.children) as HTMLElement[])
		{
			panel.style.display = 'inline-block';
		}

		// Reactive params + theme bootstrap. createParamsGUI was deleted
		// in Block 10; the lil-gui debug panel is now Vue (DebugPanel.vue).
		// Persistence lives in useEngineParams (Block 5/7). All onChange
		// side effects moved into per-subdomain watch() handlers (Block
		// 7). Only the title-screen overrides + the cannon-debugger
		// lifecycle that used to live in ParamsGUI need replicating here.
		this.params = sharedParams;
		if (localStorage.getItem('sketchbook.soundMuted') === 'true')
		{
			this.params.Master_Audio = false;
		}
		this.params.Dark_Mode = localStorage.getItem('sketchbook.darkMode') === 'true';
		document.documentElement.classList.toggle('dark', !!this.params.Dark_Mode);

		// Cannon-es-debugger init / teardown - watch instead of the old
		// onChange callback. cannon-es-debugger has no clean dispose API,
		// so we track the meshes it adds via onInit and remove them when
		// the user turns it off again.
		const stopDebugPhysics = watch(() => this.params.Debug_Physics, (enabled) =>
		{
			if (enabled)
			{
				this.cannonDebugMeshes = [];
				this.cannonDebugRenderer = CannonDebugger(
					this.graphicsWorld,
					this.physicsWorld,
					{
						onInit: (_body, mesh) => this.cannonDebugMeshes.push(mesh),
					},
				);
			}
			else
			{
				for (const mesh of this.cannonDebugMeshes)
				{
					this.graphicsWorld.remove(mesh);
				}
				this.cannonDebugMeshes = [];
				this.cannonDebugRenderer = undefined;
			}

			this.characters.forEach((char) =>
			{
				char.raycastBox.visible = enabled;
			});
		});
		this.disposers.push(stopDebugPhysics);

		// Pause menu (Esc) - disabled until the loader's
		// onFinishedCallback fires so it can't open over the welcome
		// dialog. The PauseMenu Vue component (Block 13) reads its
		// enabled flag through usePauseMenu; the Restart action calls
		// back to World.restartScenario via the state bridge.
		engineState().pause.setRestartHandler(() => this.restartScenario());
		this.disposers.push(() => engineState().pause.setRestartHandler(null));

		// Initialization
		this.inputManager = new InputManager(this, this.renderer.domElement);
		this.cameraOperator = new CameraOperator(this, this.camera, this.params.Mouse_Sensitivity);
		this.sky = new Sky(this);

		// swift502 v0.2 GameMode keys (B ball spawn, T slow-mo, V view
		// distance cycle). Available on every map, not just sw-v02 -
		// they're engine-wide free-roam features.
		wireV02GameMode(this);

		// Camera shake runs in the PostCamera slot (after CameraOperator)
		// and adds transient position offsets when vehicles slam down or
		// collide. Singleton API: anywhere can call CameraShake.trigger()
		// without a world reference.
		this.cameraShake = new CameraShake(this);
		this.registerUpdatable(this.cameraShake);

		// Outline effect - depth-based Sobel edges. Owned by World so the
		// render pipeline can call its renderPass after the composer pass.
		// No-op when params.Outlines is false.
		this.outlineEffect = new OutlineEffect(this);

		// Ambient soundscape - wind / birds / water. Lazily creates an
		// AudioContext when first enabled (browser autoplay policy is
		// satisfied by the title-screen gesture).
		this.ambientSound = new AmbientSound(this);
		this.registerUpdatable(this.ambientSound);

		// Bundled music tracks looped in shuffle, gated by
		// params.Background_Music + scaled by Master_Volume * Music_Volume.
		this.backgroundMusic = new BackgroundMusic(this);
		this.registerUpdatable(this.backgroundMusic);

		// Procedural SFX bus - footsteps / jumps / race pings / dialog
		// whoosh / vehicle crash / water splash / iris transition.
		// Stateless, no per-frame update; consumers call sfxBus.playX()
		// directly from the relevant event hook.
		this.sfxBus = new SfxBus(this);

		// engine/state/dialog needs the sfx bus for the whoosh-in cue.
		// Lazy-bound here so the dialog state module doesn't have to
		// import World (which would create a cycle).
		bindDialogSfxBus(this.sfxBus);
		this.disposers.push(() => bindDialogSfxBus(null));

		// World labels - registry + distance culling for CSS2D tags.
		// Constructed early so attachNameLabel calls from later spawn
		// code go through it.
		this.worldLabels = new WorldLabels(this);
		this.registerUpdatable(this.worldLabels);

		// Touch controls are now a Vue component (TouchControls.vue,
		// Block 17) that reads world.value from useEngineHost directly -
		// no engine-side hand-off needed.

		// Day / night cycle (ported from Inthenew/Sketchbook).
		// Mirror sky.phi back into params.Sun_Elevation (folded over 180 so
		// it stays in the slider's 0..180 range) so the listen()-bound
		// Sun_Elevation slider visibly tracks the sun while the cycle runs.
		const sunCycleHandle = setInterval(() =>
		{
			if (scope.params.Sun_Cycle)
			{
				let phi = scope.sky.phi + 0.01 * scope.params.Time_Scale;
				if (!scope.params.Has_Night_Time && phi >= 180) phi = 0;
				else if (scope.params.Has_Night_Time && phi >= 360) phi = 0;
				scope.sky.phi = phi;
				scope.params.Sun_Elevation = phi <= 180 ? phi : 360 - phi;
			}
		}, 10);
		this.disposers.push(() => clearInterval(sunCycleHandle));

		// Vehicle tuning watches. Each slider drag fans out across every
		// spawned Car so a tweak takes effect on already-on-screen
		// vehicles, not just future spawns. Centralised here (rather
		// than per-Car) because World owns the vehicles[] cache - one
		// place to fan out, no per-car watch bookkeeping.
		const applyToAllCars = (property: string, value: number, asEngineForce = false): void =>
		{
			for (const v of this.vehicles)
			{
				if (v instanceof Car)
				{
					if (asEngineForce) v.updateCarSpeed(value);
					else v.updateWheelProps(property, value);
				}
			}
		};
		this.disposers.push(
			watch(() => this.params.Friction_Slip,        (v) => applyToAllCars('frictionSlip', v)),
			watch(() => this.params.Suspension_Stiffness, (v) => applyToAllCars('suspensionStiffness', v)),
			watch(() => this.params.Max_Suspension,       (v) => applyToAllCars('maxSuspensionTravel', v)),
			watch(() => this.params.Damping_Compression,  (v) => applyToAllCars('dampingCompression', v)),
			watch(() => this.params.Damping_Relaxation,   (v) => applyToAllCars('dampingRelaxation', v)),
			watch(() => this.params.Engine_Force,         (v) => applyToAllCars('', v, true)),
		);

		// Time scale + audio + outline gates. Sun_Cycle is already polled
		// inside the setInterval above so it doesn't need a watch().
		this.disposers.push(
			watch(() => this.params.Time_Scale,    (v) => { this.timeScaleTarget = v; }),
			watch(() => this.params.Master_Audio,  () => { this.applyAudioListenerVolume(); }),
			watch(() => this.params.Master_Volume, () => { this.applyAudioListenerVolume(); }),
		);

		// Load scene if path is supplied. The argument is either a string
		// path to a .glb (loaded async via GLTFLoader) or a BaseScene
		// instance from src/ts/world/sandboxes (built synchronously in
		// its constructor). Both paths funnel into loadScene().
		if (worldScenePath !== undefined)
		{
			let loadingManager = new LoadingManager(this);
			loadingManager.onFinishedCallback = () =>
			{
				this.update(1, 1);
				this.setTimeScale(1);

				// WelcomeModal.vue (Block 12) replaces the Swal.fire
				// dialog. The promise resolves when the player clicks
				// the Okay button.
				engineState().startupModals.showWelcome().then(() =>
				{
					UIManager.setUserInterfaceVisible(true);
					engineState().pause.setEnabled(true);
				});
			};
			if (typeof worldScenePath === 'string')
			{
				loadingManager.loadGLTF(worldScenePath, (gltf) =>
				{
					loadScene(this, loadingManager, gltf);
				}
				);
			}
			else if (worldScenePath && worldScenePath.scene instanceof THREE.Object3D)
			{
				// BaseScene instance - build a synthetic GLTF-shaped object
				// and feed it through the same loadScene path. A throwaway
				// tracker entry keeps the loading-screen accounting honest
				// in case no other async loads (vehicle GLBs) follow.
				const entry = loadingManager.addLoadingEntry('sandbox-scene');
				const fakeGltf = { scene: worldScenePath.scene, animations: worldScenePath.sceneAnimations || [] };
				loadScene(this, loadingManager, fakeGltf);
				loadingManager.doneLoading(entry);
			}
		}
		else
		{
			UIManager.setUserInterfaceVisible(true);
			UIManager.setLoadingScreenVisible(false);
			// EmptyWorld.vue (Block 12) replaces Swal.fire(success).
			engineState().startupModals.showEmpty();
		}

		this.render(this);
	}

	// Update
	// Handles all logic updates.
	public update(timeStep: number, unscaledTimeStep: number): void
	{
		this.updatePhysics(timeStep);

		// Pipe Free_Cam_Speed (1..100, default 25 = upstream feel) into
		// CameraOperator's movementSpeed scalar. The base of 0.06 was the
		// original swift502 default at slider value 25; scale linearly.
		this.cameraOperator.movementSpeed = (this.params.Free_Cam_Speed / 25) * 0.06;

		// Update registred objects
		this.updatables.forEach((entity) => {
			entity.update(timeStep, unscaledTimeStep);
		});

		// Lerp time scale
		this.params.Time_Scale = THREE.MathUtils.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);

		// Physics debug
		if (this.params.Debug_Physics) tickCannonDebug(this);
	}

	public updatePhysics(timeStep: number): void
	{
		// ADD PRE-STEPS for all characters and vehicles
		this.characters.forEach((char) => {
			if (typeof char.physicsPreStep == 'function')
			{
				char.physicsPreStep(char.characterCapsule.body, char)
			}
		})

		this.vehicles.forEach((vehicle) => {
			if (vehicle instanceof Car)
			{
				vehicle.physicsPreStep(vehicle.collision, vehicle)
			} else if (vehicle instanceof Helicopter)
			{
				vehicle.physicsPreStep(vehicle.collision, vehicle)
			} else if (vehicle instanceof Airplane)
			{
				vehicle.physicsPreStep(vehicle.collision, vehicle)
			} else if (vehicle instanceof Boat)
			{
				vehicle.physicsPreStep(vehicle.collision, vehicle)
			} else if (vehicle instanceof RocketShip)
			{
				vehicle.physicsPreStep(vehicle.collision, vehicle)
			}
		})

		// Switch to lunar gravity while the player is on the moon. Moon
		// surface gravity is ~1.62 m/s^2, ~1/6 of Earth's. Inthenew left
		// this commented out as WIP; we activate it now that the rocket
		// flight reliably sets/clears world.onMoon.
		const baseG = this.onMoon ? -1.62 : -9.81;
		const targetGravityY = baseG * (this.params?.Gravity_Scale ?? 1);
		if (this.physicsWorld.gravity.y !== targetGravityY)
		{
			this.physicsWorld.gravity.set(0, targetGravityY, 0);
		}

		// Step the physics world
		this.physicsWorld.step(this.physicsFrameTime, timeStep);

		this.characters.forEach((char) => {
			if (typeof char.physicsPostStep == 'function')
			{
				char.physicsPostStep(char.characterCapsule.body, char)
			}

			if (this.isOutOfBounds(char.characterCapsule.body.position))
			{
				this.outOfBoundsRespawn(char.characterCapsule.body);
			}
		});

		this.vehicles.forEach((vehicle) => {

			if (this.isOutOfBounds(vehicle.rayCastVehicle.chassisBody.position))
			{
				let worldPos = new THREE.Vector3();
				vehicle.spawnPoint.getWorldPosition(worldPos);
				//worldPos.setComponent(1, worldPos.getComponent(1) + 1);
				let worldPos_CANNON = new CANNON.Vec3(worldPos.x, worldPos.y+1, worldPos.z)
				//worldPos.y += 1;
				this.outOfBoundsRespawn(vehicle.rayCastVehicle.chassisBody, worldPos_CANNON);
			}
		});
	}

	public isOutOfBounds(position: CANNON.Vec3): boolean
	{
		let inside = position.x > -211.882 && position.x < 211.882 &&
					position.z > -169.098 && position.z < 153.232 &&
					position.y > 0.107;
		let belowSeaLevel = position.y < 14.989;

		return !inside && belowSeaLevel;
	}

	public outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void
	{
		let newPos = position || new CANNON.Vec3(0, 16, 0);
		let newQuat = new CANNON.Quaternion(0, 0, 0, 1);

		body.position.copy(newPos);
		body.interpolatedPosition.copy(newPos);
		body.quaternion.copy(newQuat);
		body.interpolatedQuaternion.copy(newQuat);
		body.velocity.setZero();
		body.angularVelocity.setZero();
	}

	/**
	 * Rendering loop.
	 * Implements fps limiter and frame-skipping
	 * Calls world's "update" function before rendering.
	 * @param {World} world 
	 */
	public render(world: World): void
	{
		// Bail before any work if the host component already disposed
		// us - prevents one extra frame of rendering after teardown
		// and stops the RAF callback from holding the World reference
		// alive in the GC.
		if (this.disposed) return;

		this.requestDelta = this.stopwatchDelta();

		this.rafHandle = requestAnimationFrame(() =>
		{
			world.render(world);
		});

		// Getting timeStep
		let unscaledTimeStep = (this.requestDelta + this.renderDelta + this.logicDelta) ;
		let timeStep = unscaledTimeStep * this.params.Time_Scale;
		timeStep = Math.min(timeStep, 1 / 30);    // min 30 fps

		// Logic
		world.update(timeStep, unscaledTimeStep);

		// Measuring logic time
		this.logicDelta = this.stopwatchDelta();

		// Frame limiting
		let interval = 1 / 60;
		this.sinceLastFrame += this.requestDelta + this.renderDelta + this.logicDelta;
		this.sinceLastFrame %= interval;

		// Stats end
		this.stats.end();
		this.stats.begin();

		// Actual GPU dispatch (composer/renderer + outline + label) lives
		// in setup/RendererPipeline so the pipeline build + the per-frame
		// draw calls sit next to each other.
		tickRenderPipeline(this);

		// Measuring render time
		this.renderDelta = this.stopwatchDelta();
	}

	// Returns seconds elapsed since the previous call. Replaces the
	// now-deprecated THREE.Clock which was used the same way (three calls
	// per frame to measure request/logic/render phases).
	private stopwatchDelta(): number
	{
		const now = performance.now();
		const delta = (now - this.stopwatchLastTime) / 1000;
		this.stopwatchLastTime = now;
		return delta;
	}

	public setTimeScale(value: number): void
	{
		this.params.Time_Scale = value;
		this.timeScaleTarget = value;
	}

	public setMasterVolume(value: number): void
	{
		const v = Math.max(0, Math.min(100, value));
		this.params.Master_Volume = v;
		this.applyAudioListenerVolume();
	}

	// Applies the effective listener volume - 0 when Master_Audio is
	// off (mute), otherwise Master_Volume / 100. Called from both the
	// Master_Volume setter and the Master_Audio toggle so 3D audio
	// (PositionalAudio: BirdSound, CharacterSfx, Speaker) respects
	// the master gate the same way the continuous synths do via
	// getMasterVolume.
	public applyAudioListenerVolume(): void
	{
		if (!this.audioListener) return;
		const muted = this.params?.Master_Audio === false;
		this.audioListener.setMasterVolume(muted ? 0 : this.params.Master_Volume / 100);
	}

	public add(worldEntity: IWorldEntity): void
	{
		worldEntity.addToWorld(this);
		this.registerUpdatable(worldEntity);

		// Apply the current Vehicles-folder tuning to freshly spawned cars
		// so settings restored from localStorage (or changed mid-session
		// before this car existed) take effect immediately.
		if (worldEntity instanceof Car && this.params)
		{
			worldEntity.updateWheelProps('frictionSlip', this.params.Friction_Slip);
			worldEntity.updateWheelProps('suspensionStiffness', this.params.Suspension_Stiffness);
			worldEntity.updateWheelProps('maxSuspensionTravel', this.params.Max_Suspension);
			worldEntity.updateWheelProps('dampingCompression', this.params.Damping_Compression);
			worldEntity.updateWheelProps('dampingRelaxation', this.params.Damping_Relaxation);
			worldEntity.updateCarSpeed(this.params.Engine_Force);
		}
	}

	public registerUpdatable(registree: IUpdatable): void
	{
		this.updatables.push(registree);
		this.updatables.sort((a, b) => (a.updateOrder > b.updateOrder) ? 1 : -1);
	}

	public remove(worldEntity: IWorldEntity): void
	{
		worldEntity.removeFromWorld(this);
		this.unregisterUpdatable(worldEntity);
	}

	public unregisterUpdatable(registree: IUpdatable): void
	{
		_.pull(this.updatables, registree);
	}

	public launchScenario(scenarioID: string, loadingManager?: LoadingManager): void
	{
		this.lastScenarioID = scenarioID;

		// Reset cross-scenario world state so a Shift+R from the moon or
		// a scenario switch with the planet menu open lands the player
		// cleanly back on Earth.
		this.onMoon = false;
		engineState().scenario.setPlanetMenuOpen(false);

		this.clearEntities();

		// Launch default scenario
		if (!loadingManager) loadingManager = new LoadingManager(this);
		for (const scenario of this.scenarios) {
			if (scenario.id === scenarioID || scenario.spawnAlways) {
				scenario.launch(loadingManager, this);
			}
		}
	}

	public restartScenario(): void
	{
		if (this.lastScenarioID !== undefined)
		{
			// Hide the chaotic teardown / respawn flash behind the iris,
			// then re-open it once the new scenario's spawn points have
			// run. clearEntities + scenario.launch are synchronous so the
			// open() comes immediately after launchScenario returns.
			this.sfxBus.playIrisWhoosh();
			const iris = IrisTransition.getInstance();
			iris.close().then(() =>
			{
				this.launchScenario(this.lastScenarioID);
				iris.open();
			});
		}
		else
		{
			console.warn('Can\'t restart scenario. Last scenarioID is undefined.');
		}
	}

	public clearEntities(): void
	{
		// Only scenario-bound entities go here - characters, vehicles
		// and the prompts that target them. Map-bound entities
		// (animals, birds, butterflies, grass, ocean) live for the
		// whole map session and survive scenario switches; they're
		// re-injected only when the GLB reloads (= page reload via
		// the map switcher). Stale prompts left over from removed
		// NPCs self-clean on the next update via orphan-detection in
		// ProximityPrompt.update(), so we don't need to track them
		// explicitly here.
		for (let i = 0; i < this.characters.length; i++) {
			this.remove(this.characters[i]);
			i--;
		}

		for (let i = 0; i < this.vehicles.length; i++) {
			this.remove(this.vehicles[i]);
			i--;
		}
	}

	public scrollTheTimeScale(scrollAmount: number): void
	{
		// Changing time scale with scroll wheel
		const timeScaleBottomLimit = 0.003;
		const timeScaleChangeSpeed = 1.3;
	
		if (scrollAmount > 0)
		{
			this.timeScaleTarget /= timeScaleChangeSpeed;
			if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = 0;
		}
		else
		{
			this.timeScaleTarget *= timeScaleChangeSpeed;
			if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = timeScaleBottomLimit;
			this.timeScaleTarget = Math.min(this.timeScaleTarget, 1);
		}
	}

	public toggleControlsOverlay(): void
	{
		// State path drives the Vue ControlsOverlay (Block 11). The
		// legacy #controls DOM element is gone now.
		engineState().hud.toggleControlsOverlay();
	}

	public updateControls(controls: { keys: string[], desc: string }[]): void
	{
		// Routed through the state bridge. ControlsOverlay.vue (Block
		// 11) reads useControls().rows and renders KeyCap atoms.
		// The legacy DOM mutation is gone - the #controls element from
		// HTMLBootstrap is removed in Block 11 too.
		engineState().controls.setRows(controls);
	}

	// Tear down everything the World owns. Called by EngineHost.client
	// when its component unmounts (HMR during dev) so a remounted host
	// gets a clean slate. Order:
	//   1) flag disposed - the next RAF callback returns immediately
	//   2) cancel the pending RAF in case we're between schedule + fire
	//   3) run reverse-order disposers (event listeners, intervals, gui,
	//      stats, resize handler, ...) registered during construction
	//   4) drop scenario-bound entities so their physics bodies + meshes
	//      detach properly (clearEntities calls each entity's dispose)
	//   5) dispose three.js + cannon-es resources
	//   6) close audio context (none if never opened, hence the chain)
	public dispose(): void
	{
		if (this.disposed) return;
		this.disposed = true;

		if (this.rafHandle !== null)
		{
			cancelAnimationFrame(this.rafHandle);
			this.rafHandle = null;
		}

		// Reverse order so a disposer registered later (e.g. lil-gui's
		// destroy) runs before an earlier one (e.g. the resize-handler
		// removal) - mirrors RAII teardown semantics.
		while (this.disposers.length > 0)
		{
			const fn = this.disposers.pop();
			try { fn?.(); }
			catch (err) { console.warn('[World.dispose] disposer threw:', err); }
		}

		this.clearEntities();

		try { this.stats?.dom?.parentElement?.removeChild(this.stats.dom); }
		catch (_e) { /* stats already detached */ }

		try { this.gui?.destroy?.(); }
		catch (_e) { /* gui already destroyed */ }

		try { this.outlineEffect?.dispose?.(); } catch (_e) { /* noop */ }

		try
		{
			this.graphicsWorld?.traverse((obj: any) =>
			{
				if (obj.geometry?.dispose) obj.geometry.dispose();
				if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose?.());
				else if (obj.material?.dispose) obj.material.dispose();
			});
		}
		catch (_e) { /* scene already torn down */ }

		try { this.composer?.dispose?.(); } catch (_e) { /* noop */ }

		try { this.renderer?.dispose?.(); } catch (_e) { /* noop */ }

		try { this.renderer?.domElement?.parentElement?.removeChild(this.renderer.domElement); }
		catch (_e) { /* noop */ }
		try { this.labelRenderer?.domElement?.parentElement?.removeChild(this.labelRenderer.domElement); }
		catch (_e) { /* noop */ }

		try { this.audioListener?.context?.close(); }
		catch (_e) { /* context already closed */ }
	}

}