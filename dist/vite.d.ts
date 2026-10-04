import { Plugin } from "vite";
export interface BriefingPluginOptions {
  /** Entry of the plugin. Default `src/index-client.ts` */
  entry?: string;
  /** More modules to leave out of the bundle (the app must provide them) */
  external?: string[];
}
/** Modules the Briefing app provides to plugins through its import map */
export declare const briefingSharedModules: string[];
/**
 * Vite plugin that builds a Briefing plugin into `dist/`: `plugin.js` (ES
 * module), `plugin.css`, lazy chunks (components, translations) and the
 * checked `plugin-manifest.json` - copy the folder to `/plugins/<id>/` of a
 * Briefing instance. `vue`, `yjs` and `briefing-plugin-sdk` come from the app
 * and are never bundled. Only affects `vite build`.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Vue from '@vitejs/plugin-vue'
 * import { briefingPlugin } from 'briefing-plugin-sdk/vite'
 * import { defineConfig } from 'vite'
 *
 * export default defineConfig({ plugins: [Vue(), briefingPlugin()] })
 * ```
 */
export declare function briefingPlugin(opt?: BriefingPluginOptions): Plugin;
