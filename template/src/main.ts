// Only for `npm run dev`: mounts development.vue. Not part of the build.
import { createApp } from 'vue'
import Development from './client/development.vue'

createApp(Development).mount('#app')
