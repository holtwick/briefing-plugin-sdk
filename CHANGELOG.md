# Changelog

Versions follow semver: removing or renaming an export is a major version,
adding one a minor version.

## Unreleased

- `addMenuSection({ placement: 'stage-tile' })`: entries in the **...** menu
  of a camera or screen tile; `items(tile)` gets its `StageTileProps` and
  returns nothing for tiles it does not care about.
- `RoomVisitor.getTrackStats(track)` (type `TrackStats`): codec, size,
  frame rate, byte counter and encoder of the RTP streams carrying a track
  to or from that peer, for diagnostics, with the path of the connection
  (`route`) and `sfu` when it runs through a media server (LiveKit).
  `SendParameters.codecs`: preferred
  video codecs of a stream's owner.
- `AppComponent.fixedLayout` (sidebar tabs): by default the sidebar now
  scrolls a page together with its title, so a page must not scroll itself
  (no `height: 100%` plus own overflow). A page that fills the sidebar
  height and scrolls its parts itself (a list above fixed actions) sets
  `fixedLayout: true`.
- `deviceStorage` (type `DeviceStorageLike`) and `deviceRemembered`:
  storage for settings of this device, to use instead of `localStorage`
  (with vueuse: `useStorage(key, initial, deviceStorage)`). It follows the
  participant's "Remember on this device": on, it is localStorage; off, the
  tab's sessionStorage, gone when the tab closes. A device that remembers
  nothing empties localStorage at start and when the page goes, so
  settings written there directly do not last.
- `AppComponent.files` (type `AppDocumentFiles`: `extensions`, `types`,
  `maxSize`, `action`) on a `presentation` component: the files this
  document type shows. A file dropped on the room window, picked with
  "Open file..." in the stage menu or sent from the chat opens a new
  document of it; the component takes the file once with
  `state.stageFiles.take(docId)` (`StageFilesApi`, also `typesFor(file)`
  and `open(file)`; `StageFileInfo`) and shares it as if picked there.
- `PointerLayer` prop `contentBox` (a `PointerBox`): content the plugin
  places itself - a map, a zoomable canvas - tells the laser pointer where
  it is drawn right now, in surface pixels; each participant's own box,
  so a dot lands on the same spot whatever their pan and zoom. Pointer
  positions now carry nine decimals instead of four.
- `PointerApi.pointing` (optional): the laser points or draws right now
  (switched on, `L` or Space held) - a surface with own drag gestures
  leaves them to the laser meanwhile.
- `TranscriberApi.models`, `.model` and `.setModel(id?)` with the type
  `TranscriberModel` (`id`, `label`, `sizeMb`): an engine may offer the
  participant a choice of speech models; optional, engines without a
  choice leave them out.
- `MediaManager.setVideoProcessor(processor)` with the types `VideoProcessor`
  and `ProcessedVideoTrack`: a plugin turns the camera's track into the one
  that is sent (background effects, filters). The media plugin disposes the
  copy, mirrors mute onto it and falls back to the camera when the
  processor resolves `undefined` or calls `fail()`.
- `AppMenuSection` placement `camera`: entries in the camera menu of the
  toolbar button and the lobby, below the cameras.
- `AppComponent.visible`: a component (e.g. a sidebar tab) shows only while
  this returns `true`, read reactively where components are listed.
- `TranscriberApi` (`state.transcriber`) with `TranscriberStatus`,
  `TRANSCRIBER_SAMPLE_RATE` and `TRANSCRIBER_MAX_SECONDS`: speech to text in
  the browser, provided by an engine plugin, used by plugins that write
  down what is said. `transcribe(pcm, { language })` takes mono 16 kHz PCM
  and answers in order with a `TranscriberResult` (`text`, and the
  `language` used - detected when none was given). `label` tells what runs
  ("Whisper large v3 turbo (GPU)").
- `ctx.notify(notice) => close()` and the type `AppNotice`: a short notice
  (toast), shown below the room's status pills. Same `id` replaces the
  shown notice, the plugin's notices close with it. `setupTestPlugin()`
  records the open ones in `notices`.
- `CameraFacing` (`'user' | 'environment'`), `MediaState.videoFacing` (where
  the running camera points, `undefined` if unknown) and
  `MediaManagerDeviceInfo.facing`. Mirror the own camera only while
  `videoFlip` is on and `videoFacing !== 'environment'`.
- `ModerationApi` (`state.moderation`): `canEdit` (this participant may
  manage and edit stage documents - in a moderated room moderators and
  presenters; document plugins show their content read-only while it is
  `false`), `mayEdit(peerId)` (the same for a peer, for receiver-side
  checks) and `mayPoint(peerId)` (laser pointer: everybody but viewers).
  Read them optionally (`app.state.moderation?.canEdit ?? true`) to keep
  running on hosts without them. The template's counter follows `canEdit`.
- `ctx.addShortcuts(shortcut | shortcut[])`: keyboard shortcuts (`AppShortcut`:
  `id`, `title`, `group`, `keys`, `action` or `hold: { down, up }`, `when`,
  `allowInEditable`, `allowOnControls`, `repeat`, `priority`), dispatched by
  the app's `shortcuts` plugin with central guards, listed in its `?`
  overview, removed with the plugin or by the returned function.
  `ctx.shortcuts` lists all registered ones. `setupTestPlugin()` returns
  them as `shortcuts`. Types `AppShortcut`, `AppShortcutEntry`,
  `AppShortcutHold`.
- `announce(text)`: read a short text to screen reader users (polite live
  region), e.g. the new state after a shortcut.
- `state.openDataChannel(room, { name })`: an end-to-end encrypted data
  channel to every participant (`PeerDataChannel`: `send`, `sendAll`,
  `visitors`, events `dataFrame`/`dataVisitorEnters`/`dataVisitorLeaves`).
- `setupFileTransport(channel)`: share a file of this tab (`offer`,
  `withdraw`) and fetch byte ranges of files others share (`fetchRange`),
  nothing uploaded. `createRangeReader()` reads a remote file in cached,
  prefetched blocks on top of it. Types `FileTransport`, `RangeReader`,
  `PeerDataChannel`, `OpenPeerDataChannel`.
- `PointerLayer`: the laser pointer (plugin `pointer`) over content the
  plugin shows, e.g. a video or a PDF page. Pointers are matched by a
  `target` id and placed in content coordinates (`media`/`contentSize` +
  `fit`), so they sit on the same spot for everybody. Types `PointerApi`
  (`AppState.pointer`), `PointerFit`, `PointerSize`.
- `AppComponent.keepClear` (placement `presentation`): participant
  thumbnails are laid out beside the document instead of over it, e.g. for
  a video player with controls at the bottom.
- `serveVirtualFile()`: serve bytes the plugin provides (e.g. a video
  streamed from a peer) as a same-origin URL through the service worker,
  with range requests for seeking.
- README and `AGENTS.md`: how to debug a plugin inside a local Briefing
  (`--sourcemap`, `Logger` output, admin area).

## 0.1.0 - 2026-10-07

- Plugin API (`briefing-plugin-sdk`): plugin base classes and contexts,
  placements and menus, `getAppContext`, events, room/peer/media types,
  stream-name helpers, shared state (`SyncApi`), translations
  (`ctx.addLocaleMessages`), and `z`, `Logger`, `uuid`, `uuidShort`.
- `briefing-plugin-sdk/vite`: `briefingPlugin()` builds the plugin folder
  (`plugin.js`, checked `plugin-manifest.json`).
- `briefing-plugin-sdk/testing`: `setupTestPlugin()`, `provideAppContext()`.
- `AGENTS.md`: instructions for coding agents (rules, skeleton, verify loop).
