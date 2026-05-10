// Static-export builder for the deploy bundle.
//
// Runs `nuxt generate` with NUXT_APP_BASE_URL set so every emitted
// path - the script + stylesheet hrefs Nuxt writes into the HTML, and
// the runtime asset URLs the engine builds via asset() - is prefixed
// with /<TARGET>/ . Then copies the generated tree from .output/public/
// to ./<TARGET>/ so the user can SCP / rsync it straight to nginx.
//
// Usage:
//   npm run build:static                  -> defaults to TARGET=sketchbook-nuxt
//   TARGET=foo npm run build:static       -> deploys to /foo/
//
// Cross-platform: pure Node, no shell-prefix env-var quirks. Spawns
// `nuxt generate` via the locally-installed bin so it works without a
// global nuxt install.

import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, cpSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TARGET = process.env.TARGET || 'sketchbook-nuxt';
const BASE_URL = `/${TARGET}/`;

console.log(`> static build: TARGET=${TARGET}, baseURL=${BASE_URL}`);

// 1. Generate. Pass NUXT_APP_BASE_URL through env so nuxt.config.ts
// reads it. shell:true on Windows resolves the .cmd shim for `nuxt`.
const env = { ...process.env, NUXT_APP_BASE_URL: BASE_URL };
const generate = spawnSync('nuxt', ['generate'], {
	stdio: 'inherit',
	shell: true,
	env,
});
if (generate.status !== 0)
{
	console.error(`nuxt generate exited with code ${generate.status}`);
	process.exit(generate.status || 1);
}

// 2. Move .output/public -> ./TARGET/. cpSync (Node 16+) handles
// the recursive copy without an extra dependency.
const src = resolve(__dirname, '..', '.output', 'public');
const dst = resolve(__dirname, '..', TARGET);

if (!existsSync(src))
{
	console.error(`expected ${src} after nuxt generate but it doesn't exist`);
	process.exit(1);
}

if (existsSync(dst))
{
	console.log(`> removing previous ${dst}`);
	rmSync(dst, { recursive: true, force: true });
}

console.log(`> copying ${src} -> ${dst}`);
cpSync(src, dst, { recursive: true });

console.log(`> done. Upload ${TARGET}/ to https://your-server/${TARGET}/`);
