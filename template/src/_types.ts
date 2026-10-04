import { z } from 'briefing-plugin-sdk'

/** The plugin id: `id` in plugin-manifest.json, prefix of i18n keys and sync ids */
export const pluginName = 'com.example.my-plugin'

/** Settings an operator can change (admin area or env `<ID>__STEP`) */
export const configSchema = z.object({
  step: z.number().default(1).describe('How much one click adds to the counter'),
})

declare global {
  interface AppConfig {
    [pluginName]: z.infer<typeof configSchema>
  }
}
