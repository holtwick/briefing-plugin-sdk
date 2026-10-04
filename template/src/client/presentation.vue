<script setup lang="ts">
import type { AppGlobalContext } from 'briefing-plugin-sdk'
import { documentSyncId } from 'briefing-plugin-sdk'
import { inject, reactive } from 'vue'
import { pluginName } from '@/_types'

import './presentation.css'

const props = defineProps<{
  /** Set by the stage: one counter per open document */
  docId?: string
}>()

// Provided by Briefing; `npm run dev` provides a stand-in (development.vue)
const app = inject<AppGlobalContext>('app')

const t = (key: string) => app?.i18n.t(`${pluginName}.${key}`) ?? key

// Shared with everyone in the room, merged per field. Without a room (no
// `sync`) the counter is local.
const counter = app?.state.sync?.getMO(documentSyncId(pluginName, props.docId), { count: 0 }).value
  ?? reactive({ count: 0 })

const step = app?.config[pluginName]?.step ?? 1

function doIncrement() {
  counter.count += step
}
</script>

<template>
  <div class="my-plugin">
    <p>{{ t('hint') }}</p>
    <div class="my-plugin-count">
      {{ counter.count }}
    </div>
    <button type="button" class="my-plugin-button" @click="doIncrement">
      {{ t('increment') }}
    </button>
  </div>
</template>
