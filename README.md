# briefing-plugin-sdk

Build plugins for [Briefing](https://brie.fi), the end-to-end encrypted video
chat: the plugin API, a Vite preset that produces the plugin folder, and test
helpers. Start from [`template/`](https://github.com/holtwick/briefing-plugin-sdk/tree/main/template)
in the [repository](https://github.com/holtwick/briefing-plugin-sdk).

Building with a coding agent? [AGENTS.md](AGENTS.md) has the rules, a
skeleton and the verify loop; it ships with the package and the template.

Third-party plugins run at the operator's own risk: Briefing's principles and
privacy statement cover only Briefing's own code and plugins. A Briefing
instance loads them from `data/plugins/<id>/` only with
`APP__THIRD_PARTY_PLUGINS=true`.

## Entry points

| Import                        | Use                                                     |
| ----------------------------- | ------------------------------------------------------- |
| `briefing-plugin-sdk`         | Plugin code: types, `getAppContext`, `z`, `Logger`, ... |
| `briefing-plugin-sdk/vite`    | `briefingPlugin()` for `vite.config.ts`                 |
| `briefing-plugin-sdk/testing` | `setupTestPlugin()` for Vitest                          |

Import plugin code only from `briefing-plugin-sdk`, `vue` and `yjs`. The
Briefing app provides these three at runtime through its import map; the
build never bundles them, so a plugin runs on the app's own instance.

## A plugin

```text
my-plugin/
  plugin-manifest.json   { "id": "com.example.countdown", "name": "Countdown", "version": "1.0.0" }
  vite.config.ts
  src/index-client.ts    default export: the plugin class
  src/locales/en.json    { "title": "Countdown" }
```

```ts
// src/index-client.ts
import type { AppPlugin, AppPluginContext } from 'briefing-plugin-sdk'
import { defineAsyncComponent } from 'vue'

const pluginName = 'com.example.countdown' // = id in plugin-manifest.json

export default class implements AppPlugin {
  name = pluginName

  async setup(ctx: AppPluginContext) {
    void ctx.addLocaleMessages(import.meta.glob('./locales/*.json'))
    ctx.addComponent({
      placement: 'presentation', // a document type on stage
      title: `${pluginName}.title`, // i18n key, from src/locales
      component: defineAsyncComponent(() => import('./countdown.vue')),
    })
  }
}
```

## Build

```ts
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import { briefingPlugin } from 'briefing-plugin-sdk/vite'
import { defineConfig } from 'vite'

export default defineConfig({ plugins: [Vue(), briefingPlugin()] })
```

`vite build` writes `dist/`: `plugin.js`, `plugin.css`, lazy chunks and the
checked `plugin-manifest.json` - copy the folder to `/plugins/<id>/` of a
Briefing instance. The manifest is validated strictly (unknown fields are
errors here, typos would otherwise go unnoticed). `vite` without `build`
stays a normal dev server for working on the plugin standalone.

Options: `entry` (default `src/index-client.ts`), `external` (more modules the
app provides).

## Test

```ts
import { setupTestPlugin } from 'briefing-plugin-sdk/testing'
import manifest from '../plugin-manifest.json'
import Plugin from './index-client'

it('adds a stage document', async () => {
  const { components, config, emitter, messages } = await setupTestPlugin(Plugin, {
    manifest, // checked like the build does; plugin name must equal its id
    config: { seconds: 90 }, // raw config, parsed with the plugin's configSchema
  })
  expect(components.map(c => c.placement)).toEqual(['presentation'])
  expect(await messages('en')).toMatchObject({ title: 'Countdown' })
})
```

`setupTestPlugin` runs `setup()` the way the app does (real context class,
config parsing, fresh event bus) and records components, menu sections and
translations. Errors of `setup()` fail the test. Further options: `state`
(app state overrides), `activePlugins` (for `ctx.hasPlugin`). For components:
`mount(Component, provideAppContext(ctx))` with `@vue/test-utils`.

## License

MIT, see [LICENSE](LICENSE).
