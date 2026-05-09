// Engine bundle barrel. The original UMD build (`Sketchbook.World`,
// `Sketchbook.TestScene`, ...) is gone - in the Nuxt port consumers
// import named exports directly. CSS is no longer side-effect-imported
// here either; styles live in app/assets/css and per-component scoped
// blocks now (see Block 14).
//
// TouchControls is constructed in EngineHost (Block 12), not auto-
// installed at module load - that change keeps the engine free of
// global side effects, so unit tests / SSR (even with `ssr: false`,
// Nitro still imports the chunk) don't try to reach into `document`.

export { World } from './world/World'

// Procedural sandbox scenes. Bootstrap code (pages/index.vue) decides
// whether to feed the World constructor a path string (GLB) or one of
// these BaseScene subclasses (built synchronously in their constructor).
export { TestScene } from './world/sandboxes/TestScene'
export { Test2Scene } from './world/sandboxes/Test2Scene'
export { Test3Scene } from './world/sandboxes/Test3Scene'
export { Example } from './world/sandboxes/ExampleScene'
export { Sw01Scene } from './world/sandboxes/Sw01Scene'
export { Sw02Scene } from './world/sandboxes/Sw02Scene'

// Touch controls - exported for the EngineHost component to install
// once the canvas + world are alive (Block 12).
export { TouchControls } from './core/TouchControls'
