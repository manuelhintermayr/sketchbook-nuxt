// Nuxt config for Sketchbook port.
//
// SSR is off because the engine (three.js + cannon-es + Web Audio +
// stats.js DOM mount) is browser-only. `ssr: false` makes Nuxt
// build a pure SPA - matches the original webpack setup. `nuxt generate`
// produces a static dist/ usable like the original `tools/build-static.js`.

import { fileURLToPath } from 'node:url'

// Resolve the deploy base URL once so `app.baseURL` and any hrefs we
// hand-write into app.head.link share the exact same prefix. Nuxt
// prefixes its own auto-emitted scripts / stylesheets with baseURL,
// but user-supplied head entries are written verbatim - so anything
// that needs the prefix has to fold it in manually.
const BASE_URL = process.env.NUXT_APP_BASE_URL || '/'
const withBase = (path: string): string =>
	BASE_URL.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path)

export default defineNuxtConfig({
	compatibilityDate: '2026-05-01',

	ssr: false,

	devtools: { enabled: true },

	modules: [
		'@nuxt/ui',
		'@nuxtjs/i18n',
		'@vueuse/nuxt',
	],

	// Components auto-import: use the file's basename as the tag instead
	// of the default `FolderBasename` prefix. We organise by feature
	// folder (game/, modals/, hud/, ...) but want to write `<EngineHost
	// />` not `<GameEngineHost />` in templates - the folder is for code
	// navigation, not for naming.
	components: [
		{ path: '~/components', pathPrefix: false },
	],

	css: [
		'~/assets/css/main.css',
	],

	// i18n locales loaded lazily from JSON files (see Block 2).
	i18n: {
		strategy: 'no_prefix',
		defaultLocale: 'en',
		lazy: true,
		locales: [
			{ code: 'en', name: 'English', file: 'en.json' },
			{ code: 'de', name: 'Deutsch', file: 'de.json' },
			{ code: 'es', name: 'Español', file: 'es.json' },
		],
		detectBrowserLanguage: {
			useCookie: false,
			fallbackLocale: 'en',
		},
		// Mirror the original storage key so an upgraded user keeps their
		// language choice. Block 2 will wire the title-screen toggle through
		// useUserPrefs() which reads / writes the same key.
		bundle: {
			optimizeTranslationDirective: false,
		},
	},

	// Nuxt 4.4 dev-server bug workaround. With `ssr: false` the SSR
	// Vite server is never created, so the `vite:serverCreated` hook
	// for `ctx.isServer` never fires and `process.env.
	// NUXT_VITE_NODE_OPTIONS` (which carries the IPC socket path the
	// Nitro renderer uses to talk back to Vite) stays unset. Result
	// on `nuxt dev`: "Vite Node IPC socket path not configured." 500s
	// on every request. With viteEnvironmentApi:true the vite-builder
	// wires resolveServer through the client server instead, so the
	// env var gets populated. `nuxt build` / `nuxt generate` are
	// unaffected (production builds don't use the IPC socket).
	experimental: {
		viteEnvironmentApi: true,
	},

	// The original index.html added Google Fonts inline. Mount them via
	// app.head so they load on every page; matches the title-screen +
	// world-shell fonts.
	//
	// `baseURL` is honoured by Nuxt for every framework-emitted URL
	// (script tags, stylesheet links Nuxt generates itself, route
	// hrefs). It also feeds `import.meta.env.BASE_URL`, which the
	// engine's `asset()` helper reads to prefix runtime asset fetches.
	// Read from env so dev runs at `/` and `npm run build:static`
	// produces a sub-path-deployable bundle:
	//   NUXT_APP_BASE_URL=/sketchbook-nuxt/ npm run generate
	//
	// Note: hrefs we ourselves declare inside `head.link` are written
	// verbatim (Nuxt does NOT prefix them), so the favicon path goes
	// through `withBase()` to share the same prefix.
	app: {
		baseURL: BASE_URL,
		head: {
			title: 'Sketchbook',
			link: [
				{ rel: 'icon', href: withBase('/favicon.ico') },
				{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap' },
				{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Solway:wght@300;400;500;700;800&display=swap' },
				{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Catamaran:wght@400;500;700;800&display=swap' },
				{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap' },
			],
			htmlAttrs: {
				lang: 'en',
				'data-theme': 'sketchbook',
			},
		},
	},

	// Three.js / cannon-es ship as ESM. `transpile` avoids the rare case
	// where Vite's optimizer chokes on a sub-package.
	vite: {
		optimizeDeps: {
			include: ['three', 'cannon-es', 'cannon-es-debugger', 'stats.js', 'lodash-es'],
		},
	},

	// Path aliases. The engine lives at `engine/` (sibling of `app/`)
	// so Vue components / composables import it as
	// `import { World } from '~~engine/sketchbook'`. Nuxt's default
	// `~` / `@` aliases resolve into the srcDir (`app/`); we add our
	// own because the engine deliberately sits outside of it - it's
	// framework-agnostic TS, not a Nuxt-aware module.
	alias: {
		'~~engine': fileURLToPath(new URL('./engine', import.meta.url)),
	},
})
