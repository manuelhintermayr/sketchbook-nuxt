// Single source of truth for every persisted user preference.
//
// Composables that need the user's language, dark-mode flag, sound-mute
// flag or chosen map import this composable - never `localStorage`
// directly. Each value is a Vue ref backed by `@vueuse/core`'s
// `useLocalStorage`, so every read is reactive and every write fans
// out to every consumer plus the persisted value in localStorage.
//
// Storage keys mirror the original Sketchbook engine (`sketchbook.X`)
// so an upgraded user keeps their saved choices on first load.

import { useLocalStorage } from '@vueuse/core'

export type SbLocale = 'en' | 'de' | 'es'
export type SbMap = 'inthenew' | 'sc-v03' | 'sc-v04' | 'sw-v01' | 'sw-v02' | 'sc-test' | 'sc-test2' | 'sc-test3' | 'sc-example'

const KEY_LOCALE = 'sketchbook.locale'
const KEY_DARK_MODE = 'sketchbook.darkMode'
const KEY_SOUND_MUTED = 'sketchbook.soundMuted'
const KEY_MAP = 'sketchbook.map'

// Plain-string serializer - the original engine wrote `'en'` (no quotes)
// to localStorage, not `'"en"'` like JSON.stringify would. Keeps backwards
// compat with users who already have a value stored.
const stringSerializer =
{
	read: (v: string): string => v,
	write: (v: string): string => v,
}

// Boolean serializer matching the original engine's `'true'` / `'false'`
// strings (so a stored value from the old build still parses correctly).
const boolSerializer =
{
	read: (v: string): boolean => v === 'true',
	write: (v: boolean): string => v ? 'true' : 'false',
}

// Module-level singletons - declaring these inside the composable would
// give every caller their own ref and break the shared-state contract.
const locale = useLocalStorage<SbLocale>(KEY_LOCALE, 'en', { serializer: stringSerializer as any })
const darkMode = useLocalStorage<boolean>(KEY_DARK_MODE, false, { serializer: boolSerializer })
const soundMuted = useLocalStorage<boolean>(KEY_SOUND_MUTED, false, { serializer: boolSerializer })
const map = useLocalStorage<SbMap>(KEY_MAP, 'inthenew', { serializer: stringSerializer as any })

export function useUserPrefs()
{
	return { locale, darkMode, soundMuted, map }
}
