<!--
  Root Nuxt component. Mounts the global UI provider from Nuxt UI so
  every <UModal>, <UButton>, etc. has access to the design tokens, then
  renders the active page (only `pages/index.vue` exists for now - the
  whole engine lives there).
-->
<template>
	<UApp>
		<NuxtPage />
	</UApp>
</template>
