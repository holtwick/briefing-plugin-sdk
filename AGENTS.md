# Building a Briefing plugin - instructions for coding agents

Briefing (https://brie.fi) is an end-to-end encrypted video chat in the
browser. A plugin adds UI and behavior to it: a document type on the stage, a
toolbar button, a sidebar tab, a settings panel, ... This file is all you need
to build one. The authoritative API is the type declarations in
`node_modules/briefing-plugin-sdk/dist/*.d.ts` - every export has TSDoc; read
them before guessing.

## Rules

1. Import plugin code only from `briefing-plugin-sdk`, `vue` and `yjs` (plus
   libraries you bundle yourself). Never import Briefing's own sources or
   internal packages. `z`, `Logger`, `uuid`, `uuidShort` come from
   `briefing-plugin-sdk`.
2. The plugin id is reverse-DNS (`com.example.countdown`). It is the `id` in
   `plugin-manifest.json`, the `name` of the plugin class, and the prefix of
   all your i18n keys, sync ids, data channel labels and event names.
3. `src/index-client.ts` default-exports the plugin class
   (`implements AppPlugin`); `setup(ctx)` registers everything.
4. All user-visible text is an i18n key under the plugin id, with strings in
   `src/locales/<lang>.json` (at least `en.json`), registered via
   `void ctx.addLocaleMessages(import.meta.glob('./locales/*.json'))`.
5. Content Security Policy: no `eval`/`new Function`, no inline event
   handler attributes, no `javascript:` URLs. Any external host you contact
   must be added by the operator to `HTTP__CSP_ALLOWED_DOMAINS`.
6. Exchange data with other participants only through the provided encrypted
   channels: `ctx.state.sync` (`getMO` for plain objects, `getYDoc` for Yjs),
   or `RoomVisitor.getRpc`/`getDataChannel`. Never send room content to a
   server.

## Skeleton

```ts
// src/index-client.ts
import type { AppPlugin, AppPluginContext } from 'briefing-plugin-sdk'
import { defineAsyncComponent } from 'vue'
import { pluginName } from './_types'

export default class implements AppPlugin {
  name = pluginName

  async setup(ctx: AppPluginContext) {
    void ctx.addLocaleMessages(import.meta.glob('./locales/*.json'))
    ctx.addComponent({
      placement: 'presentation', // see AppComponentPlacement for all places
      title: `${pluginName}.title`,
      component: defineAsyncComponent(() => import('./components/main.vue')),
    })
  }
}
```

```ts
// src/_types.ts - config schema and global type augmentations
import { z } from 'briefing-plugin-sdk'

export const pluginName = 'com.example.countdown'

export const configSchema = z.object({
  seconds: z.number().default(60).describe('Length of the countdown'),
})

declare global {
  interface AppConfig {
    [pluginName]: z.infer<typeof configSchema>
  }
}
```

In a Vue component, get the app with `getAppContext()` (or
`inject<AppGlobalContext>('app')` if the component must also run standalone).
For a stage document (`placement: 'presentation'`) the component gets the prop
`docId`; keep shared state under `documentSyncId(pluginName, docId)`:

```ts
const app = getAppContext()
const state = app.state.sync!.getMO(documentSyncId(pluginName, props.docId), { count: 0 }).value
state.count++ // every participant sees it
```

Extension points (augment in `_types.ts` with `declare global`): `AppConfig`
(your config), `AppState` (shared app state), `AppEmitterFunctions` (events,
prefix names with something unique).

## Verify - always run before you finish

```sh
npm run check   # vue-tsc + vitest + vite build
```

- Tests use `setupTestPlugin(Plugin, { manifest })` from
  `briefing-plugin-sdk/testing`: it runs `setup()` like the app, checks the
  manifest (and that `name` equals its `id`) and records components, menu
  sections and translations. Errors in `setup()` fail the test.
- `vite build` writes `dist/` - the complete plugin folder, including the
  checked `plugin-manifest.json`. A manifest typo fails the build.

## Run it in Briefing

```sh
npm run build -- --watch
docker run -p 8080:8080 \
  -v "$PWD/dist:/app/data/plugins/com.example.countdown" \
  -e APP__THIRD_PARTY_PLUGINS=true -e APP__PLUGINS_ON=com.example.countdown \
  -e AUTH=dev holtwick/briefing-pro
```

Open http://localhost:8080, reload after each rebuild. The admin area
(`/config`, token from `AUTH`) shows why a plugin does not load.
Note: `data/plugins/` and `APP__THIRD_PARTY_PLUGINS` need a Briefing release
from October 2026 or later.

## Responsibility

Third-party plugins run at the operator's own risk. Briefing's principles and
privacy statement cover only Briefing's own code and plugins; a published
plugin is not reviewed or endorsed by Briefing.
