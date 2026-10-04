<script lang="ts" setup>
// Only for `npm run dev`: shows the plugin's component standalone, with a
// stand-in for the app context Briefing provides. Not part of the build.
import { provide, reactive } from 'vue'
import { pluginName } from '@/_types'
import messages from '@/locales/en.json'
import Presentation from './presentation.vue'

import './development.css'

const objects: Record<string, { value: any }> = {}

provide('app', {
  config: { [pluginName]: { step: 1 } },
  i18n: { t: (key: string) => (messages as Record<string, string>)[key.slice(pluginName.length + 1)] ?? key },
  state: {
    sync: {
      getMO: (id: string, initial: object) => (objects[id] ??= { value: reactive(initial) }),
    },
  },
})
</script>

<template>
  <div class="dev-stage">
    <Presentation />
  </div>
</template>
