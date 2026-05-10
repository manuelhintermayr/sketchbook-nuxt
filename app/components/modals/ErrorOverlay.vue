<!--
  ErrorOverlay - friendly fallback shown when window.error or
  unhandledrejection fires. Replaces engine/world/ui/ErrorOverlay.ts.
  The composable wires the listeners; this component renders.
-->

<script setup lang="ts">
const { t } = useI18n()
const { visible, payload, dismiss } = useErrorOverlay()

// Install the listeners once on mount. Module-level guard inside the
// composable means we do not double-wire on a remount.
onMounted(() => installErrorOverlay(t))

const onReload = (): void =>
{
	location.reload()
}

const onCopy = async (): Promise<void> =>
{
	if (payload.value === null) return
	const text = `${payload.value.code}\n${payload.value.title}\n\n${payload.value.stack}`
	try { await navigator.clipboard.writeText(text) }
	catch (_e)
	{
		// Fallback for older browsers / non-https contexts.
		const ta = document.createElement('textarea')
		ta.value = text
		ta.style.position = 'fixed'
		ta.style.opacity = '0'
		document.body.appendChild(ta)
		ta.select()
		try { document.execCommand('copy') } catch (_) { /* swallow */ }
		ta.remove()
	}
}
</script>

<template>
	<BaseModal
		id="error-overlay"
		:visible="visible"
		:dismissible="false"
		@close-attempt="dismiss"
	>
		<div class="error-overlay__icon" aria-hidden="true">!</div>
		<div class="error-overlay__code">{{ payload?.code ?? t('error.code') }}</div>
		<h2 class="error-overlay__title">{{ payload?.title ?? t('error.title') }}</h2>
		<p class="error-overlay__desc">{{ t('error.desc') }}</p>
		<div v-if="payload?.stack" class="error-overlay__stack">{{ payload.stack }}</div>
		<div class="error-overlay__actions">
			<button type="button" class="error-overlay__btn error-overlay__btn--primary" @click="onReload">
				{{ t('error.reload') }}
			</button>
			<button type="button" class="error-overlay__btn error-overlay__btn--outline" @click="onCopy">
				{{ t('error.copy') }}
			</button>
		</div>
	</BaseModal>
</template>

<style scoped>
.error-overlay__icon
{
	font-size: 64px;
	color: var(--color-error);
	margin-bottom: var(--space-4);
	line-height: 1;
	text-align: center;
}

.error-overlay__code
{
	font-family: var(--font-mono);
	font-size: var(--text-h2);
	font-weight: var(--weight-bold);
	color: var(--color-error);
	margin-bottom: var(--space-2);
	text-align: center;
}

.error-overlay__title
{
	font-family: var(--font-headline);
	font-size: var(--text-h3);
	font-weight: var(--weight-bold);
	margin-bottom: var(--space-4);
	color: var(--color-on-surface);
	text-align: center;
}

.error-overlay__desc
{
	font-size: var(--text-body-sm);
	color: var(--color-on-surface-variant);
	line-height: var(--leading-relaxed);
	margin-bottom: var(--space-6);
	text-align: center;
}

.error-overlay__stack
{
	text-align: left;
	font-family: var(--font-mono);
	font-size: var(--text-caption);
	background: var(--color-surface-container);
	padding: var(--space-4);
	border-radius: var(--radius-md);
	color: var(--color-error);
	margin-bottom: var(--space-6);
	overflow: auto;
	white-space: pre;
	line-height: 1.6;
	max-height: 240px;
}

.error-overlay__actions
{
	display: flex;
	gap: var(--space-3);
	justify-content: center;
	flex-wrap: wrap;
}

.error-overlay__btn
{
	all: unset;
	padding: var(--space-3) var(--space-6);
	font-family: var(--font-body);
	font-weight: var(--weight-bold);
	font-size: var(--text-body);
	border-radius: var(--radius-md);
	cursor: pointer;
	transition: opacity var(--motion-fast) var(--ease-default);
}

.error-overlay__btn--primary
{
	background: var(--color-primary);
	color: var(--color-on-primary);
	box-shadow: var(--shadow-gold);
}

.error-overlay__btn--primary:active
{
	box-shadow: none;
	transform: translateY(2px);
}

.error-overlay__btn--outline
{
	background: transparent;
	color: var(--color-on-surface);
	border: 2px solid var(--color-outline);
}

.error-overlay__btn--outline:hover
{
	background: var(--color-surface-container);
}
</style>
