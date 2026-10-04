import { App, Component, Raw, Ref } from "vue";
import { Router } from "vue-router";
import * as Y from "yjs";
type LogLevel = number;
declare const LogLevelAlias: Record<string, LogLevel>;
type LogLevelAliasKey = keyof typeof LogLevelAlias;
type LogLevelAliasType = number | boolean | LogLevelAliasKey;
interface LogMessage {
  level: LogLevel;
  name: string;
  messages: any[];
  line?: number;
  file?: string;
  timestamp?: number;
}
type LogMessageCompact = [timestamp: number, level: LogLevel, name: string, ...messages: any[]];
type LogHandler = (msg: LogMessage) => void;
interface LoggerInterface {
  (...messages: any[]): void;
  /** @deprecated use .level = LogLevel.off or LogLevel.all */
  active: boolean;
  level: LogLevel;
  generic: (level: LogLevel, ...messages: any[]) => void;
  debug: (...messages: any[]) => void;
  info: (...messages: any[]) => void;
  warn: (...messages: any[]) => void;
  error: (...messages: any[]) => void;
  /**
   * Throws if condition is not truthy.
   *
   * **Attention!**  Due to a bug in typescript you will need to explicitly set the `LoggerInterface` type in
   * order to have the assertions having an effect on unreachable code. Example:
   *
   * ```
   * const log: LoggerInterface = Logger('xxx')
   * ```
   *
   * Bug https://github.com/microsoft/TypeScript/issues/50363#issuecomment-1219811447
   */
  assert: (condition: unknown, ...messages: any[]) => asserts condition;
  /**
   * Always throws.
   *
   * **Attention!** Due to a bug in typescript you will need to explicitly set the `LoggerInterface` type in
   * order to have the assertions having an effect on unreachable code. Example:
   *
   * ```
   * const log: LoggerInterface = Logger('xxx')
   * ```
   *
   * Bug https://github.com/microsoft/TypeScript/issues/50363#issuecomment-1219811447
   */
  fatal: (...messages: any[]) => never;
  extend: (prefix: string) => LoggerInterface;
  factory?: LoggerContextInterface;
  label: string;
}
interface LoggerContextInterface {
  (name?: string, level?: LogLevelAliasType): LoggerInterface;
  registerHandler: (handler: LogHandler) => void;
  setFilter: (namespaces: string) => void;
  setHandlers: (handlers?: (LogHandler | undefined | null)[]) => void;
  setLock: (lock: boolean) => void;
  /** When true emits a short log message for each Logger when being set up first time. */
  setDebug: (debug: boolean) => void;
  setLogLevel: (level?: LogLevel) => void;
  setFactory: (factory: (name?: string) => LoggerInterface) => void;
}
declare function useStringHashPool(): {
  hash: (s: string) => number;
  stringForHash: (v: number) => string | undefined;
};
type UseStringHashPool = ReturnType<typeof useStringHashPool>;
type DisposerFunction = () => any | Promise<any>;
declare global {
  interface SymbolConstructor {
    readonly dispose: unique symbol;
    readonly asyncDispose: unique symbol;
  }
}
/** A disposable entry: either a function or an object with a dispose() method. */
type DisposableEntry = DisposerFunction | {
  dispose: DisposerFunction;
};
interface UseDisposeConfig {
  name?: string;
  log?: LoggerInterface;
}
declare function useDispose(opt?: string | UseDisposeConfig | LoggerInterface): ((strictSync?: boolean) => Promise<any> | void) & {
  /** Counter that increments each time dispose has been called */
  readonly disposed: number;
  add: (obj?: DisposableEntry) => DisposerFunction | undefined;
  remove: (disposable: DisposableEntry) => Promise<void> | void;
  dispose: (strictSync?: boolean) => Promise<any> | void;
  disposeSync: () => void;
  sync: () => void;
  getSize(): number;
  isDisposed(): boolean;
  [Symbol.dispose](): void | Promise<any>;
  [Symbol.asyncDispose](): Promise<any>;
};
type UseDispose = ReturnType<typeof useDispose>;
type TimerExecFunction = () => void | Promise<void>;
/** Like useDispose but with shorthands for emitter and timers */
declare function useDisposeWithUtils(config?: string | UseDisposeConfig | LoggerInterface): ((strictSync?: boolean) => Promise<any> | void) & {
  readonly disposed: number;
  add: (obj?: DisposerFunction | {
    dispose: DisposerFunction;
  }) => DisposerFunction | undefined;
  remove: (disposable: DisposerFunction | {
    dispose: DisposerFunction;
  }) => Promise<void> | void;
  dispose: (strictSync?: boolean) => Promise<any> | void;
  disposeSync: () => void;
  sync: () => void;
  getSize(): number;
  isDisposed(): boolean;
  [Symbol.dispose](): void | Promise<any>;
  [Symbol.asyncDispose](): Promise<any>;
} & {
  timeout: (fn: TimerExecFunction, timeout?: number) => DisposerFunction;
  interval: (fn: TimerExecFunction, interval?: number) => DisposerFunction;
  intervalPause: (fn: TimerExecFunction, interval?: number) => DisposerFunction;
  on: (emitter: any, eventName: string, fn: (ev?: any) => void, ...args: any[]) => DisposerFunction;
  once: (emitter: any, eventName: string, fn: (ev?: any) => void, ...args: any[]) => DisposerFunction;
};
type UseDisposeWithUtils = ReturnType<typeof useDisposeWithUtils>;
type EmitterHandler = (...objs: any[]) => void;
declare type ListenerSignature<L> = { [E in keyof L]: (...args: any[]) => any; };
declare interface DefaultListener {
  [k: string]: (...args: any[]) => any;
}
/** Signature of the `call` proxy: same arguments as the listener, but resolves to `emit`'s boolean. */
type EmitterCaller<L> = { [E in keyof L]: L[E] extends ((...args: infer A) => any) ? (...args: A) => Promise<boolean> : never; };
interface EmitterSubscriberOptions {
  priority?: number;
}
declare class Emitter<RemoteListener extends ListenerSignature<RemoteListener> = DefaultListener, LocalListener extends ListenerSignature<LocalListener> = RemoteListener> {
  private subscribers;
  private subscribersOnAny;
  _logEmitter: LoggerInterface;
  /** RPC like emitting of events. Resolves to `emit`'s boolean, not the handler's return value — use `get` for that. */
  call: EmitterCaller<RemoteListener>;
  /**
   * Emits an event and collects the results of all subscribers.
   *
   * Handlers that throw or reject are logged and excluded from the result;
   * they never affect the other subscribers.
   *
   * @param event - The event to emit.
   * @param args - The arguments to pass to the event handlers.
   * @returns The awaited results of all subscribers in priority order, or undefined if no subscribers are present.
   */
  getAll<U extends keyof RemoteListener>(event: U, ...args: Parameters<RemoteListener[U]>): Promise<Awaited<ReturnType<RemoteListener[U]>>[] | undefined>;
  /**
   * Emits an event and returns the first subscriber's result (highest priority first).
   *
   * @param event - The event to emit.
   * @param args - The arguments to pass to the event handlers.
   * @returns The awaited result of the first successful subscriber, or undefined if none.
   */
  get<U extends keyof RemoteListener>(event: U, ...args: Parameters<RemoteListener[U]>): Promise<Awaited<ReturnType<RemoteListener[U]>> | undefined>;
  /**
   * Emits an event to all subscribers and awaits their handlers.
   *
   * @param event - The event to emit.
   * @param args - The arguments to pass to the event handlers.
   * @returns A promise that resolves to true if at least one subscriber was registered.
   */
  emit<U extends keyof RemoteListener>(event: U, ...args: Parameters<RemoteListener[U]>): Promise<boolean>;
  onAny(fn: EmitterHandler): DisposerFunction;
  on<U extends keyof LocalListener>(event: U, fn: LocalListener[U], opt?: EmitterSubscriberOptions): DisposerFunction;
  onCall(handlers: Partial<LocalListener>): DisposerFunction;
  once<U extends keyof LocalListener>(event: U, listener: LocalListener[U]): DisposerFunction;
  off<U extends keyof LocalListener>(event: U, listener: LocalListener[U]): this;
  removeAllListeners(): this;
  hasListeners(event: keyof LocalListener): boolean;
  /**
   * Releases all listeners. The Emitter holds no external resources, so this is
   * just an alias for `removeAllListeners` that aligns with the disposable style
   * used across the codebase (`useDispose`, `Channel.dispose`, `using`).
   */
  dispose(): void;
  [Symbol.dispose](): void;
  waitOn<U extends keyof LocalListener, R = Parameters<LocalListener[U]>[0]>(event: U, timeoutMS?: number): Promise<R>;
  addEventListener<U extends keyof LocalListener>(event: U, fn: LocalListener[U], opt?: EmitterSubscriberOptions): DisposerFunction;
  removeEventListener<U extends keyof LocalListener>(event: U, listener: LocalListener[U]): this;
}
declare global {
  interface ZeedGlobalContext {
    emitter?: Emitter;
  }
  /**
   * Global emitter interface for Zeed, used for cross-module event emission.
   * @category Global
   */
  interface ZeedGlobalEmitter {}
}
declare global {
  interface ZeedGlobalContext {}
}
type LogOriginalConsole = Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug'> & {
  console: Console;
};
declare global {
  interface ZeedGlobalContext {
    originalConsole?: LogOriginalConsole;
  }
}
declare global {
  interface ZeedGlobalContext {
    logger?: any;
  }
}
/** See http://developer.mozilla.org/en-US/docs/Web/API/MessageEvent */
interface ChannelMessageEvent<T = any> {
  data: T;
  origin?: string;
  lastEventId?: string;
}
/**
 * Inspired by
 * http://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
 * https://deno.com/deploy/docs/runtime-broadcast-channel
 */
declare abstract class Channel<T = any, ContextType = Record<string, any>> extends Emitter<{
  message: (event: ChannelMessageEvent<T>) => void;
  messageerror: (event: ChannelMessageEvent<T>) => void;
  connect: () => void;
  disconnect: () => void;
  close: () => void;
}> {
  id: string;
  context: ContextType;
  abstract isConnected?: boolean;
  abstract postMessage(data: T): void;
  dispose: ((strictSync?: boolean) => Promise<any> | void) & {
    readonly disposed: number;
    add: (obj?: DisposerFunction | {
      dispose: DisposerFunction;
    }) => DisposerFunction | undefined;
    remove: (disposable: DisposerFunction | {
      dispose: DisposerFunction;
    }) => Promise<void> | void;
    dispose: (strictSync?: boolean) => Promise<any> | void;
    disposeSync: () => void;
    sync: () => void;
    getSize(): number;
    isDisposed(): boolean;
    [Symbol.dispose](): void | Promise<any>;
    [Symbol.asyncDispose](): Promise<any>;
  };
  /** @deprecated use .dispose() */
  close(): void;
}
interface Pipe<PipeObjectData = object, PipeRawData = PipeObjectData> {
  /** Function to post raw message */
  post: (data: PipeObjectData) => Promise<void> | void;
  /** Listener to receive raw message */
  on: (fn: (data: PipeObjectData) => Promise<void> | void) => void;
  /** Custom function to serialize data */
  serialize?: (data: PipeObjectData) => Promise<PipeRawData> | PipeRawData;
  /** Custom function to deserialize data */
  deserialize?: (data: PipeRawData) => Promise<PipeObjectData> | PipeObjectData;
}
type ArgumentsType<T> = T extends ((...args: infer A) => any) ? A : never;
type ReturnType$1<T> = T extends ((...args: any) => infer R) ? R : never;
interface RPCOptionsBasic extends Pipe {
  /** No return values expected */
  onlyEvents?: boolean;
  /** Maximum timeout for waiting for response, in milliseconds */
  timeout?: number;
  /** Custom logger */
  log?: LoggerInterface;
  /** Custom error handler */
  onError?: (error: Error, functionName: string, args: any[]) => boolean | void;
  /** Custom error handler for timeouts */
  onTimeoutError?: (functionName: string, args: any[]) => boolean | void;
  /** Throw execptions. Default: true */
  exceptions?: boolean;
  /**  */
  stringHashPool?: UseStringHashPool;
}
interface RPCFn<T> {
  /** Call the remote function and wait for the result. */
  (...args: ArgumentsType<T>): Promise<Awaited<ReturnType$1<T>>>;
  /** Send event without asking for response */
  asEvent: (...args: ArgumentsType<T>) => void;
}
type RPCReturn<RemoteFunctions> = { [K in keyof RemoteFunctions]: RPCFn<RemoteFunctions[K]>; };
declare function useRPCHub(options: RPCOptionsBasic): <LocalFunctions, RemoteFunctions = LocalFunctions>(additionalFunctions?: LocalFunctions, additionalEventNames?: string[]) => RPCReturn<RemoteFunctions>;
type UseRPCHubType = ReturnType$1<typeof useRPCHub>;
/**
 * Message for schema validation results.
 *
 * `path` is an array of property keys (Standard-Schema V1 shape), e.g.
 * `['user', 'tags', 2, 'name']`. The legacy dotted string was replaced
 * to align the parse-path with the `validate()` path.
 *
 * @category Schema
 */
interface SchemaValidateMessage {
  path: PropertyKey[];
  message: string;
  type: string;
  valid: boolean;
}
/**
 * Options accepted by {@link schemaParseObject} and {@link schemaValidateObject}.
 * @category Schema
 */
interface SchemaParseOptions {
  /** Property-key path used to scope messages during recursion. */
  path?: PropertyKey[];
  /** Collector for validation/parse messages; defaults to an internal array. */
  messages?: SchemaValidateMessage[];
  /** Whether to allow extra properties not defined in the schema. */
  allowExtra?: boolean;
  /** If true, declared defaults are not applied for missing values. */
  skipDefault?: boolean;
}
/** The Standard Schema interface. */
interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly '~standard': StandardSchemaV1.Props<Input, Output>;
}
declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Validates unknown input values. */
    readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }
  /** The result interface of the validate function. */
  type Result<Output> = SuccessResult<Output> | FailureResult;
  /** The result interface if validation succeeds. */
  interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** The non-existent issues. */
    readonly issues?: undefined;
  }
  /** The result interface if validation fails. */
  interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }
  /** The issue interface of the failure output. */
  interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }
  /** The path segment interface of the issue. */
  interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }
  /** The Standard Schema types interface. */
  interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }
  /** Infers the input type of a Standard Schema. */
  type InferInput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['input'];
  /** Infers the output type of a Standard Schema. */
  type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['output'];
}
/**
 * Metadata interface for type descriptions and additional properties
 */
interface TypeMeta {
  desc?: string;
}
/**
 * Context passed as the second argument to a `.transform(fn)` callback.
 *
 * Lets a transform report a soft failure without throwing — the return
 * value is discarded and the surrounding parse continues. Mirrors Zod's
 * `ctx.addIssue` / `z.NEVER` pattern, simplified.
 *
 * @category Schema
 */
interface SchemaTransformContext {
  /** Append an issue. Message-only form is sugar for `{ message }`. */
  addIssue: (issue: string | {
    message: string;
    path?: PropertyKey[];
  }) => void;
}
/**
 * Core Type class for schema validation and type inference
 * Implements StandardSchemaV1 for cross-library compatibility
 */
declare class Type<T = unknown> {
  readonly type: string;
  _default?: any;
  _optional?: boolean;
  _meta?: TypeMeta;
  _check?: (obj: any) => boolean;
  _object?: any;
  _type?: any;
  _union?: any;
  _enumValues?: any;
  _args?: any;
  _ret?: any;
  _info?: any;
  _transform?: (value: any, ctx: SchemaTransformContext) => any;
  constructor(name: string, options?: Partial<Type<T>>);
  /**
   * Standard Schema V1 compliance property
   * Provides a standard interface for validation and type inference
   */
  get '~standard'(): StandardSchemaV1.Props<T, T>;
  /**
   * Validation method for standard-schema compliance.
   *
   * On success, `value` carries the **output**: defaults are filled in,
   * `.transform()` callbacks are applied (also on nested properties and
   * items), and an explicit `null` on an optional field becomes `undefined`.
   * Extra object properties are passed through untouched.
   *
   * The return type is intentionally looser than `StandardSchemaV1.Result<T>`
   * (both keys accessible without narrowing); the `~standard` getter casts it.
   */
  validate(value: unknown): {
    value?: T;
    issues?: ReadonlyArray<StandardSchemaV1.Issue>;
  };
  /**
   * Run `_transform` for the `validate()` path with `ctx.addIssue` support.
   * - `ctx.addIssue(...)` calls become Standard-Schema issues; if any were
   *   raised, the return value is discarded and the result is `{ issues }`.
   * - A `throw` is caught and reported as a `Transform threw: ...` issue.
   */
  private _applyTransformValidate;
  /**
   * Parses and coerces `value` against this schema (Zod-aligned).
   * Wraps {@link safeParse}; throws on **any** issue, including per-field
   * problems that `safeParse` would report as a partial success.
   * Use `safeParse(schema, value)` for non-throwing, partial results.
   */
  parse(value?: unknown, opt?: Omit<SchemaParseOptions, 'messages'>): T;
  /**
   * Creates a copy of the type with new properties merged.
   * Spread-copies all own fields so newly added `_x` fields are never lost.
   */
  private _cloneWithProps;
  /**
   * Attaches a transformation applied after primitive coercion / validation.
   * The transform may change the output type (`Type<T>` → `Type<U>`),
   * mirroring Zod's `.transform()`. Chaining stacks transforms in order.
   *
   * Note: `value` is typed `any` to keep `Type<X>` covariantly assignable
   * (callers in `useDatabase`, `record`, etc. rely on `Type<unknown>` being
   * a supertype of `Type<{...}>`). Add an explicit annotation on the callback
   * (`fn: (s: string) => …`) if you want the input type checked.
   */
  transform<U>(fn: (value: any, ctx: SchemaTransformContext) => U): Type<U>;
  /**
   * Marks the type as optional, meaning it can be undefined
   * This is useful for properties that are not required.
   */
  optional(): Type<T | undefined>;
  /**
   * Sets a default value for the type, which will be used if the value is not provided
   * The default value can be a function that receives the schema as argument, or a static value.
   *
   * Note: the callback's `schema` parameter is typed `any` instead of `this` —
   * a `this`-typed callback parameter makes `Type<T>` invariant in `T`, and
   * `Type<unknown>` must stay assignable from `Type<{...}>` (see `transform()`).
   */
  default(value: T | ((schema?: any) => T)): Type<T>;
  /**
   * Props / Metadata for the type, like description or other properties.
   * Merges into existing meta — chaining `.meta({ a: 1 }).meta({ b: 2 })`
   * yields `{ a: 1, b: 2 }`. To clear a key, set it to `undefined`.
   */
  meta(meta: TypeMeta): Type<T>;
  /**
   * Sets the `desc` property for the type, which is a human-readable description
   */
  describe(msg: string): Type<T>;
  /**
   * Extends the type with an object, merging the properties
   */
  extend<O>(obj: O): Type<Omit<T, keyof TypeObject<O>> & TypeObject<O>>;
  /**
   * Picks certain keys from an object schema
   */
  pick<K extends keyof T>(keys: Record<K, true>): Type<Pick<T, K>>;
  /**
   * Omits certain keys from an object schema
   */
  omit<K extends keyof T>(keys: Record<K, true>): Type<Omit<T, K>>;
  /**
   * Helper method to modify object properties with a transformation function
   */
  private _transformObjectProperties;
  /**
   * Makes some or all properties of an object schema optional
   */
  partial(): Type<Partial<T>>;
  partial<K extends keyof T>(keys: Record<K, true>): Type<Partial<Pick<T, K>> & Omit<T, K>>;
  /**
   * Makes some or all properties of an object schema required
   */
  required(): Type<Required<T>>;
  required<K extends keyof T>(keys: Record<K, true>): Type<Required<Pick<T, K>> & Omit<T, K>>;
  /**
   * Helper method to clone a type with optional flag
   */
  private static _cloneTypeWithOptional;
}
/**
 * Type inference utility for extracting the TypeScript type from a schema Type
 */
type Infer<T> = T extends Type<infer TT> ? TT : never;
/**
 * Creates a string type validator
 */
declare function string(): Type<string>;
/**
 * Creates a number type validator
 */
declare function number(): Type<number>;
/**
 * Creates an integer type validator
 */
declare function int(): Type<number>;
/**
 * Creates a boolean type validator
 */
declare function boolean(): Type<boolean>;
/**
 * Creates a none type validator (undefined | null)
 * Like undefined | null in TS and nil in Swift
 */
declare function none(): Type<undefined>;
/**
 * Creates an any type validator that accepts any non-null value
 */
declare function any<T = any>(): Type<T>;
declare const float: typeof number;
declare const double: typeof number;
declare const real: typeof number;
/**
 * Utility type to make object properties optional if their value type includes undefined.
 * @category Schema
 */
type TypeObjectFixOptional<T> = { [K in keyof T as undefined extends T[K] ? K : never]?: T[K] & {}; } & { [K in keyof T as undefined extends T[K] ? never : K]: T[K] & {}; };
/**
 * Utility type for pretty-printing object types
 */
type TypeObjectPretty<V> = Extract<{ [K in keyof V]: V[K]; }, unknown>;
/**
 * Main object type utility
 */
type TypeObject<T> = TypeObjectPretty<TypeObjectFixOptional<{ [K in keyof T]: Infer<T[K]>; }>>;
/**
 * Creates an object type validator with specified properties
 */
declare function object<T>(tobj: T): Type<TypeObject<T>>;
/**
 * Creates a record type validator (object with string keys and uniform value type)
 */
declare function record<T extends Type>(valueType: T): Type<Record<string, Infer<T>>>;
/**
 * Utility type for union of types.
 * @category Schema
 */
type TypeUnion<T extends Type<any>[]> = { [K in keyof T]: T[K] extends Type<infer U> ? U : never; }[number];
/**
 * Creates a union type validator (like `string | number | boolean`)
 */
declare function union<T extends Type<any>[]>(options: T): Type<TypeUnion<T>>;
/**
 * Utility type for literal types.
 * @category Schema
 */
type TypeLiterals = string | number | bigint | boolean;
/**
 * Creates a literal value validator
 */
declare function literal<T extends TypeLiterals>(value: T): Type<T>;
/**
 * Creates a string literal union validator (like `"a" | "b" | "c"`)
 */
declare function stringLiterals<const T extends readonly string[]>(values: T): Type<T[number]>;
/**
 * Utility type for tuple types.
 * @category Schema
 */
type TypeTuple<T extends readonly Type[]> = { -readonly [K in keyof T]: T[K] extends Type<infer U> ? U : never; };
/**
 * Creates a tuple type validator with fixed length and types e.g. [string, number, boolean]
 */
declare function tuple<const T extends readonly Type[]>(items: T): Type<TypeTuple<T>>;
/**
 * Creates an array type validator for a specific item type
 */
declare function array<T>(itemType: Type<T>): Type<T[]>;
/**
 * Creates a regular function type validator
 */
declare function func<TypeFuncArgs extends [Type<unknown>, ...Type<any>[]] | [], TypeFuncRet = Type, T = (...args: TypeTuple<TypeFuncArgs>) => Infer<TypeFuncRet>>(args: TypeFuncArgs, ret: TypeFuncRet): Type<T>;
/**
 * Creates an RPC function type validator that takes one argument and returns a promise
 */
declare function rpc<TypeRpcInfo extends Type<unknown> | undefined = undefined, TypeRpcRet extends Type<unknown> = Type<void>, T = TypeRpcInfo extends undefined ? () => Infer<TypeRpcRet> : (info: Infer<TypeRpcInfo>) => Infer<TypeRpcRet> | Promise<Infer<TypeRpcRet>>>(info?: TypeRpcInfo, ret?: TypeRpcRet): Type<T>;
interface TypeMeta {
  swiftName?: string;
  swiftProtocol?: string;
  swiftDesc?: string;
  swiftDefault?: string;
}
interface TypeMeta {
  argShort?: string;
  argDesc?: string;
}
interface TypeMeta {
  envDesc?: string;
  envPrivate?: boolean;
  envSkip?: boolean;
}
declare namespace z_collection_d_exports {
  export { any, array, boolean, double, stringLiterals as enum, float, func, Infer as infer, int, literal, none, number, object, real, record, rpc, string, tuple, Type as type, union };
}
/** A named media stream of a peer, see `stream-names` */
interface PeerStream {
  name: string;
  stream: MediaStream;
}
/**
 * Limits for the encoding of one local stream towards one peer, applied via
 * `RTCRtpSender.setParameters` without renegotiation. Absent fields mean no
 * limit.
 */
interface SendParameters {
  /** Video only, `>= 1` */
  scaleResolutionDownBy?: number;
  /** Bits per second */
  maxBitrate?: number;
  /** Video only */
  maxFramerate?: number;
}
/** Events of a `RoomVisitor` */
interface RoomVisitorEvents {
  peerReady: () => void;
  peerSignal: (data: any) => void;
  peerStream: (stream?: MediaStream, name?: string) => void;
  peerDataChannel: (channel: RTCDataChannel) => void;
  peerError: (msg: any) => void;
  peerClose: () => void;
}
/**
 * A remote participant and the encrypted peer connection to them. For own
 * data exchange use `getRpc` or `getDataChannel` with a label prefixed by
 * the plugin name - never open other paths to peers.
 */
interface RoomVisitor extends Emitter<RoomVisitorEvents> {
  /** Chosen by the peer for the whole room session, stable across signaling reconnects. */
  readonly peerId: string;
  /** Shall we initiate connections? */
  readonly initiator: boolean;
  /** Close it all */
  close: () => Promise<void>;
  /** WebRTC negotiation channel */
  signal: (data: Uint8Array) => void;
  /**
   * Main stream
   * @deprecated use ???
   */
  readonly stream?: MediaStream;
  /** Vue reactive remote streams */
  readonly streamsRemote: Record<string, PeerStream>;
  /** Set local media stream */
  setStreamLocal: (stream?: MediaStream, name?: string) => void;
  dispose: UseDispose;
  /** Typed RPC with this peer over an encrypted data channel named `label` */
  getRpc: <LocalFunctions>(label: string, functions: LocalFunctions) => RPCReturn<LocalFunctions>;
  /** Raw message channel with this peer, encrypted, named `label` */
  getDataChannel: (label: string) => Channel;
  createDataChannel: (label: string, options?: RTCDataChannelInit) => RTCDataChannel | undefined;
  setStream: (stream?: MediaStream, name?: string) => void;
  /**
   * Limit how the local stream `name` is encoded for this peer only; `null`
   * removes all limits. Kept across stream and device changes. Absent for
   * transports that adapt on their own (LiveKit).
   */
  setSendParameters?: (name: string, kind: 'audio' | 'video', params: SendParameters | null) => Promise<void>;
  /**
   * Six emoji both participants can compare out loud: equal on both ends
   * unless someone sits between the two browsers. `undefined` while not
   * connected, or for transports without a direct connection (LiveKit).
   */
  getSafetyCode?: () => Promise<string[] | undefined>;
}
/** Admission state of the local participant */
type RoomState = 'admin' | 'pending' | 'rejected' | 'accepted' | 'error';
/** Events of a `Room`: `room.on('roomVisitorReady', visitor => ...)` */
interface RoomEvents {
  /** Joined the room on the server */
  roomDidJoin: () => void;
  /** State of room changed */
  roomStateUpdate: (state: RoomState) => void;
  /** A remote peer is connected and ready to receive data */
  roomVisitorReady: (visitor: RoomVisitor) => void;
  /** Removed remote visitor */
  roomVisitorLeaves: (visitor: RoomVisitor) => void;
  /** Properties changed like streams */
  roomVisitorUpdate: (visitor: RoomVisitor) => void;
}
/**
 * How peers find each other: `server` through the signaling server
 * (room-safe), `direct` without any server (the optional `direct` plugin).
 */
type RoomSignaling = 'server' | 'direct';
/**
 * What a room is meant for, chosen by whoever creates the link and carried in
 * its fragment (`parseRoomFragment`): `video` (default) is a call - camera
 * and microphone start as each participant last chose in the lobby -, `chat`
 * is text only: no permission is asked, there is no lobby and no media.
 */
type RoomMode = 'video' | 'chat';
interface RoomEnterOptions {
  /** Default `server` */
  signaling?: RoomSignaling;
  /** Default `video` */
  mode?: RoomMode;
  /** Our peer id, if chosen elsewhere: by the inviting peer (direct mode), or the one we had before an update reload */
  peerId?: string;
}
/** The room the local participant is in (`state.room`), an emitter of `RoomEvents` */
interface Room extends Emitter<RoomEvents> {
  /** Room name as in the link. Never send it to the server, use `serverId` */
  readonly name: string;
  /** Room password, part of the end-to-end key. Never send it anywhere */
  secret: string;
  /** Our own peer id, chosen by us for the whole room session. */
  readonly peerLocalId?: string;
  /**
   * The opaque id the server knows this room by, derived from name and
   * secret (by the `room-safe` plugin). Set once joined. Plugins that
   * address the room on the server use this, never the name.
   */
  readonly serverId?: string;
  /** `direct`: there is no server - `rpcHubServer` calls fail, `serverId` is unset. Absent means `server`. */
  readonly signaling?: RoomSignaling;
  /** Communication with the server. Plugins may define their own RPCs using this hub. */
  readonly rpcHubServer: UseRPCHubType;
  /** What the room is meant for, part of `url()`. Absent means `video`. */
  readonly mode?: RoomMode;
  /** Public URL to open the room */
  url: () => string;
  /** Internal: join on the server */
  join: () => void;
  /** Call `fn` for every connected remote peer */
  forEachVisitor: (fn: (visitor: RoomVisitor) => void) => void;
  dispose: UseDispose;
}
interface RoomManager {
  roomUrl: () => string | undefined;
  roomEnter: (name: string, secret?: string, options?: RoomEnterOptions) => Promise<void>;
  roomLeave: () => Promise<void>;
}
/**
 * How large a remote video is rendered on this device. A renderer reports
 * every change and `visible: false` when it stops showing the video (also on
 * unmount): the stream is then only sent at a minimal level.
 */
interface VideoView {
  /** Identifies one rendering place, the same stream may be shown more than once */
  viewId: string;
  peerId: string;
  streamName: string;
  visible: boolean;
  /** Box size in CSS pixels */
  width?: number;
  height?: number;
  /** Size of the received frames, for the aspect ratio */
  sourceWidth?: number;
  sourceHeight?: number;
  /** `cover` crops to fill the box, `contain` letterboxes */
  fit?: 'cover' | 'contain';
}
declare global {
  /**
   * Events on the app-wide bus (`ctx.on(...)`, `ctx.emitter.emit(...)`).
   * Plugins add their own from their `_types.ts`, prefixed with the plugin
   * name to avoid clashes:
   *
   * ```ts
   * declare global {
   *   interface AppEmitterFunctions {
   *     myPluginDidSomething: (info: { id: string }) => void
   *   }
   * }
   * ```
   *
   * A listener may return a value; `await ctx.emitter.get('event', ...)`
   * resolves with the first one.
   */
  interface AppEmitterFunctions {
    /** Before the Vue app is mounted; the core registers router, i18n and similar here. For experts only */
    appWillMount: (app: App) => void;
    /** The `room` is initialized but not yet joined or connected. When in doubt use `appDidEnterRoom` */
    appWillEnterRoom: (info: {
      name: string;
      room: Room;
      dispose: UseDisposeWithUtils;
    }) => void;
    /** The room is set up: the place to start room related work (sync, data channels, RPC). `dispose` ends with the room */
    appDidEnterRoom: (info: {
      name: string;
      room: Room;
      dispose: UseDisposeWithUtils;
    }) => void;
    /** Before the room is left and disposed: last chance to clean up `room` related state. Counterpart to `appDidEnterRoom` */
    appWillLeaveRoom: (info: {
      name: string;
    }) => void;
    /**
     * Request ICE server configuration for TURN/STUN.
     * Listener should provide ICE config via the event object.
     */
    appGetIceConfig: () => Promise<RTCConfiguration>;
    /** You want to send out a stream with video and audio? Then emit this one.  */
    appSetMediaStream: (stream: MediaStream | undefined, name?: string) => void;
    /**
     * Someone asks to end the local stream `name` (e.g. the close button on its
     * stage tile). The plugin that owns it stops capturing and emits
     * `appSetMediaStream(undefined, name)`; nobody listening means nothing happens.
     */
    appStopMediaStream: (name: string) => void;
    /**
     * A remote video is shown (or no longer shown) on this device. Renderers
     * like stage-pro report every tile, the `video-adapt` plugin turns that
     * into per-peer send hints. Nobody listening is fine: then every peer
     * keeps sending at full quality.
     */
    appReportVideoView: (view: VideoView) => void;
    /** Internal: i18n changes */
    i18nEvent: (info: any) => void;
  }
}
/** The typed app-wide event bus, see `AppEmitterFunctions` */
type AppEmitter = Emitter<AppEmitterFunctions>;
/** Which local tracks to start */
interface MediaStartOptions {
  audio?: boolean;
  video?: boolean;
}
/** Controls the local camera and microphone (`state.media.manager`) */
interface MediaManager {
  /** Acquire what is asked for (default both); tracks already running are kept. */
  start: (options?: MediaStartOptions) => Promise<void>;
  stop: () => Promise<void>;
  /** Stop one kind of track (camera light off), unlike muting it */
  stopAudio: () => Promise<void>;
  stopVideo: () => Promise<void>;
  chooseVideoDevice: (deviceId: string) => Promise<void>;
  chooseAudioDevice: (deviceId: string) => Promise<void>;
  /** Unmuting without a track (joined without it) acquires one */
  setAudioMute: (mute: boolean) => Promise<void>;
  setVideoMute: (mute: boolean) => Promise<void>;
  /**
   * Ask for the permission to list the devices of a kind by name, without
   * switching anything on (browsers name devices only once allowed). Resolves
   * whether it was granted.
   */
  requestDeviceAccess?: (kind: 'audio' | 'video') => Promise<boolean>;
}
/** A camera or microphone, see `MediaState.devices` */
interface MediaManagerDeviceInfo {
  readonly deviceId: string;
  readonly groupId: string;
  readonly title: string;
  readonly kind: MediaDeviceKind;
  readonly label: string;
  readonly active: boolean;
  readonly muted: boolean;
}
/** Reactive state of the local camera and microphone (`state.media`) */
interface MediaState {
  readonly videoFlip: boolean;
  readonly videoMute: boolean;
  readonly audioMute: boolean;
  readonly devices: MediaManagerDeviceInfo[];
  readonly stream?: Raw<MediaStream>;
  readonly manager?: Raw<MediaManager>;
  readonly access?: 'ok' | 'not-allowed' | 'not-available' | 'error';
}
/**
 * Base class of every plugin. A host (Briefing, ...) narrows `Context` to the
 * context object its plugins receive in `setup()`.
 *
 * @example
 * ```ts
 * export default class MyPlugin extends PluginBase<MyHostContext> {
 *   name = 'com.example.my-plugin'
 *   async setup(ctx: MyHostContext) {
 *     ctx.log.info('ready')
 *   }
 * }
 * ```
 */
declare abstract class PluginBase<Context = unknown> {
  /** Unique plugin name. External plugins use their reverse-DNS id, e.g. `com.example.my-plugin` */
  abstract name: string;
  /** Names of plugins this plugin depends on */
  requires?: string[];
  /** Schema of the configuration this plugin accepts, validated before `setup()` */
  configSchema?: Type<object>;
  /** Called once after all plugins are registered and configured */
  abstract setup(context: Context): Promise<void>;
  /** Cleanup at the end of life */
  dispose?: UseDisposeWithUtils;
  /** Setup order, lower runs earlier. Default `0` */
  sortWeight?: number;
}
/** Access to the other plugins, available on every context */
interface PluginRegistryApi<Plugin extends PluginBase<any> = PluginBase<any>> {
  getActivePluginNames: () => string[];
  getAvailablePluginNames: () => string[];
  getPlugin: (name: string) => Plugin | undefined;
}
/** A message tree of one language, e.g. `{ title: 'Countdown', start: 'Start' }` */
type LocaleMessages = Record<string, unknown>;
/** Messages of one language, inline or loaded on demand (`() => import('./de.json')`) */
type LocaleSource = LocaleMessages | (() => Promise<unknown>);
/**
 * Translations a plugin ships, by language. Either keyed by language code,
 * or straight from Vite's `import.meta.glob('./locales/*.json')` - the
 * language is then taken from the file name (`de.json` -> `de`).
 *
 * @example
 * ```ts
 * ctx.addLocaleMessages({ en: { title: 'Countdown' }, de: { title: 'Countdown' } })
 * ctx.addLocaleMessages(import.meta.glob('./locales/*.json')) // loads only the languages in use
 * ```
 */
type PluginLocales = Record<string, LocaleSource>;
interface LoggingInfo {
  messages: LogMessageCompact[];
}
interface BriefingTypeMetaExtensions {
  shared?: boolean;
  multiline?: boolean;
  hide?: boolean;
  color?: boolean;
}
declare function pluginTypeMeta<T extends BriefingTypeMetaExtensions>(meta: T): T;
interface TypeMeta extends BriefingTypeMetaExtensions {}
declare global {
  /**
   * Client-side merged plugin config. Plugins augment this from their own
   * `_types.ts` via `declare global { interface AppConfig { ... } }`.
   */
  interface AppConfig {}
}
type AppPluginContextApi = PluginRegistryApi<AppPluginBase>;
interface AppBaseContext<Config = AppConfig> {
  emitter: AppEmitter;
  config: Config;
  dispose: UseDisposeWithUtils;
  logging: LoggingInfo;
  plugins: AppPluginContextApi;
  log: LoggerInterface;
}
interface AppPluginBaseContext<Config = AppConfig> extends AppBaseContext<Config> {
  on: <U extends keyof AppEmitterFunctions>(event: U, listener: AppEmitterFunctions[U], opt?: EmitterSubscriberOptions) => DisposerFunction;
  hasPlugin: (name: string) => boolean;
}
/**
 * Base class of every Briefing plugin, see `PluginBase` for the members
 * (`name`, `requires`, `configSchema`, `setup`, `sortWeight`).
 */
declare abstract class AppPluginBase<Context = AppBaseContext> extends PluginBase<Context> {}
/**
 * A plain object shared by all participants of the room. Change
 * `value` like any reactive Vue object; changes travel to everyone and merge
 * per field (last writer wins).
 */
interface SyncedObject<T extends object = object> {
  /** Reactive, shared state */
  readonly value: T;
  /** Stop syncing (also happens when the room ends) */
  dispose: UseDisposeWithUtils;
}
/**
 * Shared state of the room, end-to-end encrypted over the peer connections
 * (`state.sync`, provided by the `sync` plugin; `undefined` outside a room).
 * Use ids prefixed with your plugin name; for a stage document use
 * `documentSyncId(pluginName, docId)` so two documents never share state.
 *
 * @example
 * ```ts
 * const sync = getAppContext().state.sync!
 * const counter = sync.getMO(`${pluginName}:counter`, { count: 0 })
 * counter.value.count++ // everyone sees the new value
 *
 * const ydoc = sync.getYDoc(documentSyncId(pluginName, props.docId))
 * ydoc.getText('body') // for editors with Yjs bindings
 * ```
 */
interface SyncApi {
  /** Shared plain object `id`, created with `initial` if nobody has it yet */
  getMO: <T extends object = object>(id: string, initial: T) => SyncedObject<T>;
  /** Shared Yjs document `id`; `create` builds a custom `Y.Doc` on first use */
  getYDoc: (id: string, create?: (y: typeof Y) => Y.Doc) => Y.Doc;
  /** Stop syncing `id` and everything below it (`<id>:...`) and forget it locally, e.g. for a closed document */
  release: (id: string) => Promise<void>;
  /** Ids of all shared objects (`getMO`), for debugging */
  keysforMO: Readonly<Ref<string[]>>;
}
/** A remote participant in `state.visitors`, keyed by peer id */
interface RoomVisitorState {
  id: string;
  error?: string;
  visitor: Raw<RoomVisitor>;
  stream?: Raw<MediaStream>;
}
/** Which columns of the room are shown, see `AppState.panes` */
interface RoomPanes {
  stage: boolean;
  chat: boolean;
}
declare global {
  interface AppState {
    /** Internal: enter and leave rooms */
    roomManager?: RoomManager;
    /** Is the technology supported? */
    isSupported: boolean;
    /** The actual room object */
    room?: Room;
    /** Admission state in the current room */
    roomState?: RoomState;
    /** Mode of the room being entered or in, from the link fragment */
    roomMode?: RoomMode;
    /**
     * Set while the lobby is shown: the room is not entered yet, plugins
     * prepare the participant (placement `lobby`, e.g. camera preview).
     */
    lobby?: {
      name: string;
      secret?: string;
      mode: RoomMode;
    };
    /**
     * Set while a room link without password is open: the room is not
     * entered yet, its password is asked for (or a new room started), see
     * `app.askPassword`. Links from the start page always carry one.
     */
    roomPassword?: {
      name: string;
      mode: RoomMode;
    };
    /**
     * What to share on entering the room, instead of the choice remembered
     * from the lobby. Set when a call resumes after an update reload, so
     * camera and microphone come back exactly as they were.
     */
    roomMedia?: MediaStartOptions;
    /** Reactive visitors info */
    visitors: Record<string, RoomVisitorState>;
    /** Shared state of the room, see `SyncApi`. Set while in a room (plugin `sync`) */
    sync?: SyncApi;
    /** Media handling via `media` or `media-pro` */
    media: MediaState;
    /**
     * Every local stream announced via `appSetMediaStream`, by name (see
     * `stream-names`). The main camera is also in `media.stream`.
     */
    streamsLocal: Record<string, Raw<MediaStream>>;
    /** @deprecated Layout: Contain or crop video representation */
    fill: boolean;
    /** @deprecated Layout: Show my video smaller. Contains my ID */
    maximized: string;
    /** Which sidebar to show */
    sidebarMode: string;
    /**
     * The room's columns next to the sidebar: stage (tiles) and chat. Their
     * defaults follow `roomMode` (video: stage, chat: chat column); with
     * neither on, a chat room shows the chat and a video room the stage.
     */
    panes: RoomPanes;
  }
}
declare global {
  interface AppConfig {}
}
interface AppComponentBasic {
  /** Location where the component will be used */
  /** An internal name */
  name?: string;
  /** A public title */
  title?: string;
  /** The actual Vue component */
  component: Component;
  /** A value that can be passed to the component, like a plugin specific state */
  value?: any;
  /** Number indicating the position of placement */
  sortWeight?: number;
  /** Icon component, used where the placement shows one (e.g. the admin navigation) */
  icon?: Component;
  /**
   * Only show the component in rooms of these modes, e.g. `['video']` for
   * camera or stage settings that mean nothing in a chat room. Outside a
   * room (`state.roomMode` unset) it is always shown. Default: all modes.
   */
  roomModes?: RoomMode[];
}
/** A sidebar tab: needs a `name` and an icon as SVG source */
interface AppComponentSidebar extends AppComponentBasic {
  /** A tab in the sidebar (`sidebar-left` is unused) */
  placement: 'sidebar-left' | 'sidebar-right';
  name: string;
  /** Icon as SVG code */
  iconSvg: string;
}
interface AppComponentSimple extends AppComponentBasic {
  placement:
  /** Global additions outside the routing, like for overlays (beta, pro, etc) */
  'app-addition' |
  /**
   * A document type on stage-pro (whiteboard, editor, ...). Any number of
   * documents can be open at once, each in its own tile. The component gets
   * the prop `docId` and keeps its shared state under `documentSyncId(name,
   * docId)` (e.g. `sync.getYDoc(...)`), so two documents of the same type do
   * not share content.
   */
  'presentation' |
  /** Panel in settings */
  'settings' |
  /** Stuff that is above stage, like hint for sharing */
  'stage-overlay' |
  /** Replace the whole default stage. Must only be one! */
  'stage-container' |
  /**
   * The chat column between stage and sidebar (`state.panes.chat`); in a
   * chat room without open documents it is the main area, on narrow
   * screens next to the stage a sheet (titled by `title`). Must only be one!
   */
  'pane-chat' |
  /** If alone in the room, show share card. Must only be one! */
  'stage-share' |
  /** Share card content for direct-mode rooms (no server, no room link), see the `direct` plugin */
  'direct-invite' |
  /** Replace the whole default sidebar. Must only be one! */
  'sidebar-container' |
  /** The toolbar itself. Must only be one! */
  'toolbar' |
  /** Replace the whole right toolbar. Must only be one! */
  'toolbar-sidebar-container' | 'toolbar-sidebar' |
  /** Buttons or similar for the toolbar */
  'toolbar-left' | 'toolbar-middle-left' | 'toolbar-middle-right' | 'toolbar-right' |
  /** Start page between room name input and footer. Used by "history" plugin. */
  'welcome-middle' |
  /** The top level */
  'room' |
  /**
   * Before entering an audio or video room (`state.lobby` is set): prepare
   * the participant, e.g. camera preview and on/off switches (`media-pro`).
   * Without any component here the room is entered right away.
   */
  'lobby' |
  /** Fields in the lobby's side column above "Join", e.g. the display name (`users`) */
  'lobby-form' |
  /**
   * A section of the admin area (`/config`, an `OuiApp`), shown after a
   * successful admin login. Set `title` (i18n key) and `icon`. The component
   * gets an `adminFetch(url)` prop that sends the admin token.
   */
  'admin';
}
/** A component a plugin adds with `ctx.addComponent()` */
type AppComponent = AppComponentSimple | AppComponentSidebar;
/** One entry of a menu another plugin owns; compatible with `OuiMenuItem` */
interface AppMenuItem {
  title?: string;
  icon?: Component;
  checked?: boolean;
  disabled?: boolean;
  /** Destructive action, drawn in the danger color */
  danger?: boolean;
  header?: boolean;
  /** Runs right in the click, so it may call APIs that need a user gesture (`getDisplayMedia`) */
  action?: () => void;
}
/**
 * Entries a plugin adds to a menu of another plugin, as a group; groups are
 * separated and sorted by `sortWeight`. `items` is read whenever the menu
 * renders, so it may depend on reactive state.
 */
interface AppMenuSection {
  /** `stage` - the share menu of the stage (stage-pro): screens, documents, fullscreen */
  placement: 'stage';
  items: () => AppMenuItem[];
  sortWeight?: number;
  roomModes?: RoomMode[];
}
/** Where a component is shown, see the comments on each value of `AppComponent['placement']` */
type AppComponentPlacement = AppComponent['placement'];
/**
 * The app as seen by plugins and their Vue components (`getAppContext()`).
 * Also available as `ctx` in `setup()`.
 */
interface AppGlobalContext extends AppBaseContext {
  /** The Vue app, e.g. to register global components */
  vue: App;
  router: Router;
  /**
   * Reactive app state shared by all plugins: room, peers (`visitors`),
   * media, shared state (`sync`). Plugins add their own via
   * `declare global { interface AppState { ... } }`.
   */
  state: AppState;
  /** All registered components, read them per placement with `computedComponents()` */
  components: AppComponent[];
  /** All registered menu sections, read them with `menuSectionItems()` */
  menus: AppMenuSection[];
  i18n: {
    /** Translate an i18n key (`$t` in templates) */
    t: (s: string) => string;
    /** @internal Host hook behind `AppPluginContext.addLocaleMessages` */
    addMessages?: (pluginId: string, locales: PluginLocales) => Promise<void>;
  };
}
/** What a plugin's `setup(ctx)` receives */
interface AppPluginContext extends AppPluginBaseContext, AppGlobalContext {
  /** Show a Vue component at a placement (stage document, toolbar button, sidebar, settings panel, ...). Removed with the plugin */
  addComponent: (info: AppComponent) => void;
  /** Add entries to a menu another plugin owns, e.g. the stage share menu */
  addMenuSection: (info: AppMenuSection) => void;
  /**
   * Add the plugin's translations. They live under the plugin's name, so
   * `title` of plugin `com.example.countdown` becomes the key
   * `com.example.countdown.title`.
   * Ship at least `en`, the fallback language; languages the app does not
   * offer are ignored. No need to await: texts update once loaded.
   *
   * @example
   * ```ts
   * // locales/en.json: { "title": "Countdown", "start": "Start" }
   * void ctx.addLocaleMessages(import.meta.glob('./locales/*.json'))
   * ctx.addComponent({ placement: 'presentation', title: `${pluginName}.title`, component })
   * ```
   */
  addLocaleMessages: (locales: PluginLocales) => Promise<void>;
}
/**
 * Base class of a Briefing client plugin; a plugin module exports its class
 * as `default`. `implements AppPlugin` is enough, no runtime base needed.
 */
declare abstract class AppPlugin extends AppPluginBase<AppPluginContext> {}
/** Briefing's `plugin-manifest.json`: the generic manifest with Briefing's `$schema` */
declare const manifestSchema: Type<Omit<{
  $schema?: string | undefined;
  url?: string | undefined;
  description?: string | undefined;
  author?: string | undefined;
  authorUrl?: string | undefined;
  fundingUrl?: string | Record<string, string> | undefined;
  minAppVersion?: string | undefined;
  id: string;
  name: string;
  version: string;
}, "$schema"> & {
  $schema?: string | undefined;
}>;
/** Get the app context from within a Vue component. Shortcut to the equivalent `inject` call, but with safety net. */
declare function getAppContext(): AppGlobalContext | never;
/**
 * Entries of all sections for a menu, separated by an empty entry; reactive
 * when used inside a `computed`.
 */
declare function menuSectionItems(app: AppGlobalContext, placement: AppMenuSection['placement']): AppMenuItem[];
/** Vue computed list of components for a certain placement */
declare function computedComponents(placement: AppComponentPlacement, orderby?: string[]): import("vue").ComputedRef<AppComponent[]>;
export { Room as A, UseDisposeWithUtils as B, PluginLocales as C, MediaState as D, MediaStartOptions as E, RoomVisitor as F, LogLevelAliasType as H, RoomVisitorEvents as I, SendParameters as L, RoomMode as M, RoomState as N, AppEmitter as O, PeerStream as P, z_collection_d_exports as R, LocaleSource as S, MediaManagerDeviceInfo as T, LoggerInterface as U, DisposerFunction as V, AppPluginBase as _, AppComponent as a, pluginTypeMeta as b, AppGlobalContext as c, AppPlugin as d, AppPluginContext as f, SyncedObject as g, SyncApi as h, manifestSchema as i, RoomEvents as j, VideoView as k, AppMenuItem as l, RoomVisitorState as m, menuSectionItems as n, AppComponentPlacement as o, RoomPanes as p, getAppContext as r, AppComponentSidebar as s, computedComponents as t, AppMenuSection as u, AppPluginContextApi as v, MediaManager as w, LocaleMessages as x, BriefingTypeMetaExtensions as y, Type as z };