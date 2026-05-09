// Bridge between useUserPrefs().locale (the persisted source of truth)
// and @nuxtjs/i18n's runtime locale. The original engine read its own
// localStorage key on every t() call - we centralise that into the
// preference composable and let i18n's setLocale handle reactive
// translation updates from there.

export default defineNuxtPlugin(async (nuxtApp) =>
{
	const { locale } = useUserPrefs()
	const i18n = nuxtApp.$i18n as { locale: { value: string }, setLocale: (loc: string) => Promise<void> }

	// Apply the persisted locale on first paint. Without this, i18n falls
	// back to the configured default ('en') and the title screen flashes
	// English before the user's saved choice loads in.
	if (locale.value && i18n.locale.value !== locale.value)
	{
		await i18n.setLocale(locale.value)
	}

	// Mirror future changes from the title-screen + settings modal back
	// into i18n. The original engine triggered location.reload() to apply
	// a new locale - here every active component re-renders against the
	// new translations automatically, no reload needed.
	watch(locale, async (next) =>
	{
		if (next && i18n.locale.value !== next)
		{
			await i18n.setLocale(next)
		}
	})
})
