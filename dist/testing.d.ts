import { C as PluginLocales, O as AppEmitter, a as AppComponent, d as AppPlugin, f as AppPluginContext, u as AppMenuSection } from "./plugin-DsgI22NV.js";
export interface SetupTestPluginOptions {
  /** Raw config of the plugin, as an operator would set it; parsed with the plugin's `configSchema` */
  config?: Record<string, any>;
  /** Overrides of the app state (`room`, `sync`, `visitors`, ...) */
  state?: Partial<AppState>;
  /**
   * The plugin's `plugin-manifest.json` content: checked like the build does
   * it, and the plugin's `name` must equal its `id`.
   */
  manifest?: unknown;
  /** Names of other plugins `ctx.hasPlugin()` should report as active */
  activePlugins?: string[];
}
export interface TestPlugin {
  plugin: AppPlugin;
  /** The context `setup()` received */
  ctx: AppPluginContext;
  /** Components added with `ctx.addComponent()` */
  components: AppComponent[];
  /** Menu sections added with `ctx.addMenuSection()` */
  menus: AppMenuSection[];
  /** Translations added with `ctx.addLocaleMessages()` */
  locales: PluginLocales[];
  /** The event bus, e.g. `await emitter.emit('appDidEnterRoom', ...)` */
  emitter: AppEmitter;
  /** The plugin's parsed config (`ctx.config[plugin.name]`) */
  config: any;
  /** Load the added translations of one language, merged */
  messages: (lang: string) => Promise<Record<string, unknown>>;
  /** Dispose the plugin like the app does on shutdown */
  dispose: () => Promise<void>;
}
/** A fresh app state with the defaults of an app outside a room */
export declare function createTestState(state?: Partial<AppState>): AppState;
/**
 * Run a plugin's `setup()` against a test context, the way the Briefing app
 * does: config parsed with the plugin's `configSchema`, the real context
 * class, a fresh event bus. Everything the plugin registers is recorded.
 *
 * @example
 * ```ts
 * import { setupTestPlugin } from 'briefing-plugin-sdk/testing'
 * import manifest from '../plugin-manifest.json'
 * import Plugin from './index-client'
 *
 * it('adds a stage document', async () => {
 *   const { components } = await setupTestPlugin(Plugin, { manifest })
 *   expect(components.map(c => c.placement)).toEqual(['presentation'])
 * })
 * ```
 */
export declare function setupTestPlugin(PluginClass: new () => AppPlugin, opt?: SetupTestPluginOptions): Promise<TestPlugin>;
/**
 * Mount options for `@vue/test-utils` so a plugin component finds the app
 * context (`getAppContext()`): `mount(Component, provideAppContext(ctx))`.
 */
export declare function provideAppContext(ctx: AppPluginContext): {
  global: {
    provide: {
      app: AppPluginContext;
    };
  };
};
