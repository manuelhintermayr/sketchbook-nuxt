// Bridge between useUserPrefs().locale (the persisted source of truth)
// and @nuxtjs/i18n's runtime locale. The original engine read its own
// localStorage key on every t() call - we centralise that into the
// preference composable and let i18n's setLocale handle reactive
// translation updates from there.
//
// The plugin is intentionally synchronous - awaiting setLocale() at
// plugin init blocks Nuxt's IPC handshake on Windows (manifests as
// "NUXT_VITE_NODE_OPTIONS.socketPath is not defined"). Fire-and-
// forget is fine here: the first vue-i18n render uses the configured
// default locale, then re-renders on the resolved promise.

export default defineNuxtPlugin((nuxtApp) =>
{
	const { locale } = useUserPrefs()
	const i18n = nuxtApp.$i18n as { locale: { value: string }, setLocale: (loc: string) => Promise<void> }

	if (locale.value && i18n.locale.value !== locale.value)
	{
		void i18n.setLocale(locale.value)
	}

	watch(locale, (next) =>
	{
		if (next && i18n.locale.value !== next)
		{
			void i18n.setLocale(next)
		}
	})
})
