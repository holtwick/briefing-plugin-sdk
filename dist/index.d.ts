import { $ as MediaManagerDeviceInfo, A as StageTileItem, B as AppShortcut, C as AppComponentSidebar, Ct as LogLevelAliasType, D as AppNotice, E as AppMenuSection, F as SyncApi, G as BriefingTypeMetaExtensions, H as AppShortcutHold, I as SyncedObject, J as LocaleSource, K as pluginTypeMeta, L as AppDocumentFiles, M as UsersItemProps, N as RoomPanes, O as AppPlugin, P as RoomVisitorState, Q as MediaManager, R as StageFileInfo, S as AppComponentPlacement, St as DisposerFunction, T as AppMenuItem, U as AppPluginBase, V as AppShortcutEntry, W as AppPluginContextApi, X as ModerationApi, Y as PluginLocales, Z as ModerationRole, _ as TranscriberResult, _t as SendParameters, a as FileTransportOptions, at as VideoView, b as manifestSchema, bt as Type, c as deviceRemembered, ct as PeerDataChannelEvents, d as menuSectionItems, dt as RoomMode, et as MediaStartOptions, f as getAppContext, ft as RoomState, g as TranscriberModel, gt as RoomVisitorEvents, h as TranscriberApi, ht as RoomVisitor, i as FileTransport, it as AppEmitter, j as StageTileProps, k as AppPluginContext, l as deviceStorage, lt as Room, m as TRANSCRIBER_SAMPLE_RATE, mt as PeerStream, n as PointerFit, nt as ProcessedVideoTrack, o as setupFileTransport, ot as OpenPeerDataChannel, p as TRANSCRIBER_MAX_SECONDS, pt as ConnectionRoute, q as LocaleMessages, r as PointerSize, rt as VideoProcessor, s as DeviceStorageLike, st as PeerDataChannel, t as PointerLayer, tt as MediaState, u as computedComponents, ut as RoomEvents, v as TranscriberStatus, vt as TrackStats, w as AppGlobalContext, wt as LoggerInterface, x as AppComponent, xt as UseDisposeWithUtils, y as PointerApi, yt as z_collection_d_exports, z as StageFilesApi } from "./plugin-DRcmxiyo.js";
export declare function Logger(name?: string, level?: LogLevelAliasType): LoggerInterface;
/**
 * Generate a short, collision-resistant identifier of `len` base62 characters,
 * each drawn **uniformly** from the 62-symbol alphabet (~5.95 bits/char, so
 * `len` chars ≈ `len * 5.95` bits).
 *
 * Prefer this over slicing a fixed-width {@link uuidB62}: a slice loses entropy
 * because `2^128` sits just above `62^21`, which constrains the leading digit
 * (an 8-char prefix carries ~45 bits, not the full ~48). Here every character
 * is independent and unbiased (rejection sampling drops the `byte % 62` tail),
 * so the full per-character entropy is realized.
 *
 * Intended for ids whose uniqueness scope is a single container - a document's
 * block map, a block's span map - not global identifiers (use {@link uuid} for
 * those). Purely random, not sortable.
 *
 * @param len - number of characters (default 12, ~71 bits)
 * @returns base62 string of length `len`
 */
export declare function uuidShort(len?: number): string;
/**
 * Generate an identifier using the current encoding mode.
 *
 * If the default encoding is configured with `sorted=true`, this returns a
 * sortable SUID; otherwise a random UUID is returned.
 *
 * @returns encoded identifier string
 */
export declare function uuid(): string;
/**
 * Every local stream is sent under a name, the receiver gets it back as the
 * key of `visitor.streamsRemote`. The name tells what the stream shows:
 *
 * - `video` - the main camera, together with the microphone
 * - `video:<id>` - an additional camera, video only (e.g. the back camera)
 * - `desktop` / `desktop:<id>` - a shared screen or window
 *
 * Unknown names count as camera, like the core did before names had a kind.
 */
type StreamKind = 'camera' | 'screen';
export declare const STREAM_NAME_CAMERA = "video";
export declare const STREAM_NAME_SCREEN = "desktop";
export declare function streamKind(name?: string): StreamKind;
export declare function isScreenStream(name?: string): boolean;
export declare function isCameraStream(name?: string): boolean;
/** The main camera stream, the one carrying the microphone */
export declare function isMainCameraStream(name?: string): boolean;
/** `makeStreamName('screen', 'a1')` → `desktop:a1`; without id the plain prefix */
export declare function makeStreamName(kind: StreamKind, id?: string): string;
/**
 * Id of the shared state (`sync.getYDoc`, `sync.getMO`) of one stage
 * document. Without a `docId` (an older stage) the plain type name, like it
 * was when there was only one document per type.
 */
export declare function documentSyncId(type: string, docId?: string): string;
/**
 * Tell screen reader users about a change they caused without looking, e.g.
 * "Microphone off" after a shortcut. Polite: read after what is being read.
 * Pass translated text. Shown by `AnnounceRegion`, which the always-on
 * plugin `app` mounts once; without it nothing is read.
 */
export declare function announce(text: string): void;
/**
 * Reads byte ranges of a remote file in fixed blocks: caches the most recent
 * blocks (seeking back costs nothing), fetches a few blocks ahead of every
 * read (playback rarely waits), and asks for each block only once, however
 * many reads need it at the same time.
 */
interface RangeReaderOptions {
  size: number;
  blockSize: number;
  /** Bytes of block `index`: `blockSize` of them, fewer for the last block */
  fetchBlock: (index: number) => Promise<Uint8Array>;
  /** Blocks fetched ahead of the last block of a read */
  prefetch?: number;
  /** Blocks kept, least recently used are dropped */
  maxBlocks?: number;
}
interface RangeReader {
  /** Bytes `[start, end)` */
  read: (start: number, end: number) => Promise<Uint8Array>;
  /** Number of blocks held or in flight */
  readonly cachedBlocks: number;
}
export declare function createRangeReader(opt: RangeReaderOptions): RangeReader;
/** The bytes behind a virtual file, see `serveVirtualFile()` */
interface VirtualFileSource {
  /** Total size in bytes, known up front */
  size: number;
  /** MIME type, e.g. `video/mp4` - the media element needs it for some containers */
  type?: string;
  /**
   * Bytes `[start, end)`, exactly `end - start` of them. Called on demand
   * while the file is played; may be slow (e.g. fetched from a peer).
   */
  read: (start: number, end: number) => Promise<Uint8Array | ArrayBuffer>;
}
/** A file served by the service worker, see `serveVirtualFile()` */
interface VirtualFile {
  /** Same-origin URL, e.g. for `<video src>` */
  url: string;
  /** Stops serving; requests for the URL then fail with 404 */
  dispose: () => void;
}
/**
 * Serves bytes the page provides as a same-origin URL, through the service
 * worker - e.g. to play a video in `<video src>` that is fetched piece by
 * piece from a peer. The media element asks for byte ranges as it plays and
 * seeks; `source.read()` is called for exactly those.
 *
 * Resolves `undefined` where this is not possible: no service worker
 * controls the page (first visit, private mode, development build) or the
 * active one predates this feature. Fall back to a whole-file `Blob` URL then.
 *
 * The file is served while the page is open and until `dispose()`.
 *
 * @example
 * ```ts
 * const file = await serveVirtualFile({ size, type: 'video/mp4', read: (start, end) => fetchRange(start, end) })
 * video.src = file?.url ?? URL.createObjectURL(await downloadAll())
 * ```
 */
export declare function serveVirtualFile(source: VirtualFileSource): Promise<VirtualFile | undefined>;
export { type AppComponent, type AppComponentPlacement, type AppComponentSidebar, type AppDocumentFiles, type AppEmitter, type AppGlobalContext, type AppMenuItem, type AppMenuSection, type AppNotice, AppPlugin, AppPluginBase, type AppPluginContext, type AppPluginContextApi, type AppShortcut, type AppShortcutEntry, type AppShortcutHold, type BriefingTypeMetaExtensions, type ConnectionRoute, type DeviceStorageLike, type DisposerFunction, type FileTransport, type FileTransportOptions, type LocaleMessages, type LocaleSource, type LoggerInterface, type MediaManager, type MediaManagerDeviceInfo, type MediaStartOptions, type MediaState, type ModerationApi, type ModerationRole, type OpenPeerDataChannel, type PeerDataChannel, type PeerDataChannelEvents, type PeerStream, type PluginLocales, type PointerApi, type PointerFit, PointerLayer, type PointerSize, type ProcessedVideoTrack, type RangeReader, type RangeReaderOptions, type Room, type RoomEvents, type RoomMode, type RoomPanes, type RoomState, type RoomVisitor, type RoomVisitorEvents, type RoomVisitorState, type SendParameters, type StageFileInfo, type StageFilesApi, type StageTileItem, type StageTileProps, type StreamKind, type SyncApi, type SyncedObject, TRANSCRIBER_MAX_SECONDS, TRANSCRIBER_SAMPLE_RATE, type TrackStats, type TranscriberApi, type TranscriberModel, type TranscriberResult, type TranscriberStatus, type Type, type UseDisposeWithUtils, type UsersItemProps, type VideoProcessor, type VideoView, type VirtualFile, type VirtualFileSource, computedComponents, deviceRemembered, deviceStorage, getAppContext, manifestSchema, menuSectionItems, pluginTypeMeta, setupFileTransport, z_collection_d_exports as z };