<!--
  EmptyWorld - shown when World was constructed without a scene path.
  Replaces the Swal.fire 'Hello world' dialog the empty branch
  triggered. Dismissible because there's nothing time-sensitive about
  the message.
-->

<script setup lang="ts">
const { t } = useI18n()
const { empty } = useStartupModals()
</script>

<template>
	<BaseModal
		id="empty-world"
		:visible="empty.visible.value"
		backdrop-close
		@close="empty.close()"
	>
		<div class="empty__icon" aria-hidden="true">✓</div>
		<h2 class="empty__title">{{ t('world.empty.title') }}</h2>
		<p class="empty__body">{{ t('world.empty.body') }}</p>
		<footer class="empty__footer">
			<button type="button" class="empty__confirm" @click="empty.close()">
				{{ t('world.welcome.button') }}
			</button>
		</footer>
	</BaseModal>
</template>

<style scoped>
.empty__icon
{
	font-size: var(--text-display);
	color: var(--color-success);
	text-align: center;
	margin-bottom: var(--space-3);
}

.empty__title
{
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h3);
	margin: 0 0 var(--space-3);
	text-align: center;
}

.empty__body
{
	margin: 0 0 var(--space-4);
	line-height: var(--leading-normal);
	text-align: center;
}

.empty__footer
{
	display: flex;
	justify-content: center;
}

.empty__confirm
{
	all: unset;
	background: var(--color-primary);
	color: var(--color-on-primary);
	font-family: var(--font-label);
	font-weight: var(--weight-bold);
	padding: var(--space-3) var(--space-6);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-gold);
	cursor: pointer;
}
</style>
