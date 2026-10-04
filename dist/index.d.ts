import { A as Room, B as UseDisposeWithUtils, C as PluginLocales, D as MediaState, E as MediaStartOptions, F as RoomVisitor, H as LogLevelAliasType, I as RoomVisitorEvents, L as SendParameters, M as RoomMode, N as RoomState, O as AppEmitter, P as PeerStream, R as z_collection_d_exports, S as LocaleSource, T as MediaManagerDeviceInfo, U as LoggerInterface, V as DisposerFunction, _ as AppPluginBase, a as AppComponent, b as pluginTypeMeta, c as AppGlobalContext, d as AppPlugin, f as AppPluginContext, g as SyncedObject, h as SyncApi, i as manifestSchema, j as RoomEvents, k as VideoView, l as AppMenuItem, m as RoomVisitorState, n as menuSectionItems, o as AppComponentPlacement, p as RoomPanes, r as getAppContext, s as AppComponentSidebar, t as computedComponents, u as AppMenuSection, v as AppPluginContextApi, w as MediaManager, x as LocaleMessages, y as BriefingTypeMetaExtensions, z as Type } from "./plugin-DsgI22NV.js";
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
export { type AppComponent, type AppComponentPlacement, type AppComponentSidebar, type AppEmitter, type AppGlobalContext, type AppMenuItem, type AppMenuSection, AppPlugin, AppPluginBase, type AppPluginContext, type AppPluginContextApi, type BriefingTypeMetaExtensions, type DisposerFunction, type LocaleMessages, type LocaleSource, type LoggerInterface, type MediaManager, type MediaManagerDeviceInfo, type MediaStartOptions, type MediaState, type PeerStream, type PluginLocales, type Room, type RoomEvents, type RoomMode, type RoomPanes, type RoomState, type RoomVisitor, type RoomVisitorEvents, type RoomVisitorState, type SendParameters, type StreamKind, type SyncApi, type SyncedObject, type Type, type UseDisposeWithUtils, type VideoView, computedComponents, getAppContext, manifestSchema, menuSectionItems, pluginTypeMeta, z_collection_d_exports as z };