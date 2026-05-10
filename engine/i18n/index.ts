// Engine i18n bridge.
//
// Engine classes (World, Character, Vehicle, NameLabel, ProximityPrompt,
// SettingsModal, ParamsGUI, ...) call `t(key, vars)` directly without
// needing to know about Vue or Nuxt. The actual implementation is
// injected once at boot from the Nuxt-side EngineHost component, which
// has access to `useI18n().t` and the locale ref from useUserPrefs.
//
// Until the bridge is bound, t() returns the raw key - that way an
// engine import inside a unit test or pre-mount race doesn't crash;
// it just shows the placeholder text.

export type Locale = 'en' | 'de' | 'es'

export const LOCALE_LABELS: { [k in Locale]: string } =
{
	en: 'English',
	de: 'Deutsch',
	es: 'Español',
}

type TFn = (key: string, vars?: { [k: string]: string }) => string
type LocaleGetter = () => Locale
type LocaleSetter = (locale: Locale) => void
type LocaleHasStored = () => boolean

let _t: TFn | null = null
let _getLocale: LocaleGetter | null = null
let _setLocale: LocaleSetter | null = null
let _hasStored: LocaleHasStored | null = null

export interface EngineI18nImpl
{
	t: TFn
	getLocale: LocaleGetter
	setLocale: LocaleSetter
	hasStoredLocale: LocaleHasStored
}

// Wired up once by the EngineHost.client component when Nuxt has
// finished booting. Subsequent calls overwrite the binding (handy for
// HMR during dev so a fresh i18n instance replaces the old).
export function bindEngineI18n(impl: EngineI18nImpl): void
{
	_t = impl.t
	_getLocale = impl.getLocale
	_setLocale = impl.setLocale
	_hasStored = impl.hasStoredLocale
}

export function t(key: string, vars?: { [k: string]: string }): string
{
	return _t !== null ? _t(key, vars) : key
}

export function getLocale(): Locale
{
	return _getLocale !== null ? _getLocale() : 'en'
}

export function setLocale(locale: Locale): void
{
	_setLocale?.(locale)
}

export function hasStoredLocale(): boolean
{
	return _hasStored !== null ? _hasStored() : false
}
