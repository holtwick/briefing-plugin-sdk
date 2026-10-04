import type { AppPlugin, AppPluginContext } from 'briefing-plugin-sdk'
import { defineAsyncComponent } from 'vue'
import { configSchema, pluginName } from './_types'

/**
 * A shared counter as stage document: open it from the stage menu, everyone
 * in the room sees and changes the same number.
 */
export default class Plugin implements AppPlugin {
  name = pluginName
  configSchema = configSchema

  async setup(ctx: AppPluginContext): Promise<void> {
    // Strings are loaded per language on demand, no need to wait
    void ctx.addLocaleMessages(import.meta.glob('./locales/*.json'))

    ctx.addComponent({
      placement: 'presentation', // a document type on stage
      title: `${pluginName}.title`, // i18n key, see src/locales
      component: defineAsyncComponent(() => import('./client/presentation.vue')),
    })
  }
}
