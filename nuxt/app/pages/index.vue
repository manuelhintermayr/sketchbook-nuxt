<!--
  Home / only page. The whole app sits inside <EngineHost />, which
  owns the canvas + every overlay built in Blocks 5-12.

  ssr is disabled globally in nuxt.config.ts, so this page already only
  renders on the client - no <ClientOnly> wrap needed (and adding one
  here turned out to confuse Vite's tree-shaking, dropping the entire
  engine module out of the bundle).
-->

<template>
	<EngineHost />
</template>
