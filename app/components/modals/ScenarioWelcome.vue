<!--
  ScenarioWelcome - per-scenario Play dialog. Same shape as
  WelcomeModal but body content comes from the scenario's
  descriptionContent (which can be plain text or HTML, so we use
  v-html on a sanitised string).
-->

<script setup lang="ts">
const { scenarioWelcome, scenarioWelcomeTitle, scenarioWelcomeBody } = useStartupModals()
</script>

<template>
	<BaseModal
		id="scenario-welcome"
		:visible="scenarioWelcome.visible.value"
		:dismissible="false"
		@close="scenarioWelcome.close()"
	>
		<h2 class="sw__title">{{ scenarioWelcomeTitle }}</h2>
		<div class="sw__body" v-html="scenarioWelcomeBody" />
		<footer class="sw__footer">
			<button type="button" class="sw__confirm" @click="scenarioWelcome.close()">
				Play
			</button>
		</footer>
	</BaseModal>
</template>

<style scoped>
.sw__title
{
	font-family: var(--font-headline);
	font-weight: var(--weight-bold);
	font-size: var(--text-h2);
	margin: 0 0 var(--space-4);
}

.sw__body
{
	margin: 0 0 var(--space-5);
	line-height: var(--leading-normal);
	color: var(--color-overlay-text);
}

.sw__footer
{
	display: flex;
	justify-content: flex-end;
}

.sw__confirm
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
