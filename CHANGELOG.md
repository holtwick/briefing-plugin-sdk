# Changelog

Versions follow semver: removing or renaming an export is a major version,
adding one a minor version.

## 0.1.0 - 2026-10-07

- Plugin API (`briefing-plugin-sdk`): plugin base classes and contexts,
  placements and menus, `getAppContext`, events, room/peer/media types,
  stream-name helpers, shared state (`SyncApi`), translations
  (`ctx.addLocaleMessages`), and `z`, `Logger`, `uuid`, `uuidShort`.
- `briefing-plugin-sdk/vite`: `briefingPlugin()` builds the plugin folder
  (`plugin.js`, checked `plugin-manifest.json`).
- `briefing-plugin-sdk/testing`: `setupTestPlugin()`, `provideAppContext()`.
- `AGENTS.md`: instructions for coding agents (rules, skeleton, verify loop).
