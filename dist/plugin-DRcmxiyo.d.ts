import { App, Component, PropType, Raw, Ref } from "vue";
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
  /**
   * Video only: codecs to prefer, as mime types, best first (e.g.
   * `video/AV1`). Others stay possible behind them, so every receiver still
   * finds one it can decode. Set by the stream's owner (`setSendDefaults`),
   * not by receivers.
   */
  codecs?: string[];
}
/**
 * What the browser reports about one RTP stream of a track, for diagnostics.
 * Counters only: rates come from two readings (`bytes`, `timestamp`).
 */
interface TrackStats {
  /** Stats id, the same RTP stream reads the same over several peers (LiveKit) */
  id: string;
  direction: 'in' | 'out';
  /** Mime type, e.g. `video/AV1` */
  codec?: string;
  width?: number;
  height?: number;
  framesPerSecond?: number;
  /** Sent or received so far */
  bytes: number;
  /** Milliseconds */
  timestamp: number;
  /** Encoder or decoder the browser picked, e.g. `libaom`, `VideoToolbox` (Chromium only) */
  implementation?: string;
  /** Hardware encoder or decoder (Chromium only) */
  powerEfficient?: boolean;
  /** Why the encoder sends less than asked: `bandwidth`, `cpu`, `none`, ... */
  qualityLimitationReason?: string;
  /** SVC layers, e.g. `L1T3` */
  scalabilityMode?: string;
  /** Simulcast layer */
  rid?: string;
  /** Path of the connection carrying it, see `ConnectionRoute` */
  route?: ConnectionRoute;
  /** Through a media server (LiveKit): `route` is the way to the server, not to the peer */
  sfu?: boolean;
}
/**
 * The path a direct connection takes: `local` both ends on the same network,
 * `direct` straight between the two (through NAT, found via STUN), `relay`
 * through a TURN server (on at least one end).
 */
type ConnectionRoute = 'local' | 'direct' | 'relay';
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
  /**
   * How the direct connection to this peer runs right now. `undefined`
   * while not connected or when the browser reports no candidates, absent
   * for transports without a direct connection (LiveKit).
   */
  getConnectionRoute?: () => Promise<ConnectionRoute | undefined>;
  /**
   * Diagnostics of the RTP streams carrying `track` to or from this peer:
   * a received track of theirs, or a local track we send them. `undefined`
   * while not connected or when the transport cannot tell.
   */
  getTrackStats?: (track: MediaStreamTrack) => Promise<TrackStats[] | undefined>;
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
  /**
   * Bytes sent and received so far over all media connections of this room
   * (counters only grow; rates come from two calls). Optional: transports
   * without it show no traffic.
   */
  getTraffic?: () => Promise<RoomTraffic>;
  /**
   * Drop a peer and refuse it for the rest of this room session: its
   * connection is closed, its join verifications fail, its key exchange
   * messages are ignored. Peer ids are chosen by the clients, so this only
   * holds against the same id - a new secret (`rotateSecret`) is what keeps
   * the person out. Optional: used by the `moderation` plugin.
   */
  denyPeer?: (peerId: string) => void | Promise<void>;
  /**
   * Move the whole call to a new secret without hanging up: the room key
   * and the server's room id change, existing direct connections stay.
   * Peers not in `keep` are dropped. Resolves `false` where the transport
   * cannot do it (it then changes nothing). Optional: mesh only for now.
   */
  rotateSecret?: (secret: string, keep?: string[]) => Promise<boolean>;
  /**
   * Stop (`true`) or resume receiving the sound of a peer, to save bandwidth
   * while it is not played anyway (muted by a moderator, a viewer). Optional:
   * where the transport cannot (mesh), the sound still arrives and the
   * receivers simply do not play it. Used by the `moderation` plugin.
   */
  ignoreAudioOf?: (peerId: string, ignore: boolean) => void;
  dispose: UseDispose;
}
interface RoomTraffic {
  bytesSent: number;
  bytesReceived: number;
}
interface RoomManager {
  roomUrl: () => string | undefined;
  roomEnter: (name: string, secret?: string, options?: RoomEnterOptions) => Promise<void>;
  roomLeave: () => Promise<void>;
}
/** Events of a `PeerDataChannel` */
interface PeerDataChannelEvents {
  /** The channel to this visitor is open, frames can be sent */
  dataVisitorEnters: (visitor: RoomVisitor) => void;
  /** The channel to this visitor closed (visitor left or channel dropped) */
  dataVisitorLeaves: (visitor: RoomVisitor) => void;
  /** A decrypted frame, delivered in order and one at a time per visitor */
  dataFrame: (visitor: RoomVisitor, frame: Uint8Array) => void | Promise<void>;
}
/**
 * An end-to-end encrypted data channel to every participant of the room,
 * carrying frames: small binary messages (below 64 KB) whose format belongs
 * to the plugin. Sending waits while a peer's buffer is full, frames arrive
 * in order. Open it with `state.openDataChannel(room, { name })`.
 */
interface PeerDataChannel {
  emitter: Emitter<PeerDataChannelEvents>;
  /** Sends one frame; `false` if there is no open channel to the visitor (the frame is dropped) */
  send: (visitor: RoomVisitor, frame: Uint8Array) => Promise<boolean>;
  /** Sends one frame to every visitor with an open channel */
  sendAll: (frame: Uint8Array) => Promise<void>;
  /** Visitors with an open channel */
  visitors: () => RoomVisitor[];
  /** The peer broke the protocol: drop the channel to it */
  closeVisitor: (visitor: RoomVisitor, reason: string, err?: unknown) => void;
  dispose: UseDisposeWithUtils;
}
/** Opens a `PeerDataChannel` in `room`; `name` (the plugin name) keeps channels of plugins apart */
type OpenPeerDataChannel = (room: Room, opt: {
  name: string;
}) => PeerDataChannel;
declare global {
  interface AppState {
    /**
     * Opens an encrypted data channel to every peer of a room, see
     * `PeerDataChannel`. Provided by the app; dispose the channel when the
     * room is left.
     */
    openDataChannel?: OpenPeerDataChannel;
  }
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
     * like `stage` report every tile, the `video-adapt` plugin turns that
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
/** A processed copy of the camera, see `VideoProcessor` */
interface ProcessedVideoTrack {
  /** Sent instead of the camera's track */
  track: MediaStreamTrack;
  /** Stops `track` and frees everything behind it; the camera's track stays */
  dispose: () => void;
}
/**
 * Turns the camera's track into the track that is sent (background effects,
 * filters). Called for every new camera track and whenever the processor is
 * set again. Resolve `undefined` to send the camera as it is (not possible
 * here, not ready yet - set the processor again once it is). Call
 * `fail()` when a running copy breaks: the camera's track is sent again
 * until the processor is set anew. Mute and unmute reach the copy too.
 */
type VideoProcessor = (camera: MediaStreamTrack, context: {
  fail: () => void;
}) => Promise<ProcessedVideoTrack | undefined>;
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
  /**
   * Process the camera before it is sent, see `VideoProcessor`; `undefined`
   * removes it. One processor at a time, the last one set wins. Setting the
   * same function again applies it anew (e.g. after its options changed).
   */
  setVideoProcessor?: (processor?: VideoProcessor) => Promise<void>;
}
/**
 * Where a camera points: `user` at the person (front camera, webcam),
 * `environment` away from them (rear camera, macOS Desk View).
 */
type CameraFacing = 'user' | 'environment';
/** A camera or microphone, see `MediaState.devices` */
interface MediaManagerDeviceInfo {
  readonly deviceId: string;
  readonly groupId: string;
  readonly title: string;
  readonly kind: MediaDeviceKind;
  readonly label: string;
  readonly active: boolean;
  readonly muted: boolean;
  /** Cameras only, when the browser or the label tells */
  readonly facing?: CameraFacing;
}
/** Reactive state of the local camera and microphone (`state.media`) */
interface MediaState {
  /** The user's wish to see the own camera mirrored; applies only to a camera not facing `environment` */
  readonly videoFlip: boolean;
  /** Where the running camera points, `undefined` if unknown */
  readonly videoFacing?: CameraFacing;
  readonly videoMute: boolean;
  readonly audioMute: boolean;
  readonly devices: MediaManagerDeviceInfo[];
  readonly stream?: Raw<MediaStream>;
  readonly manager?: Raw<MediaManager>;
  readonly access?: 'ok' | 'not-allowed' | 'not-available' | 'error';
}
/**
 * Roles in a moderated room (plugin `moderation`). `moderator`: holds the
 * room's moderator key; `presenter`: may share (screens, stage documents),
 * manage and edit stage documents and drive presentations (slides);
 * `participant`: the default - camera, microphone, chat, raise hand,
 * reactions and the laser pointer, but no sharing and stage documents
 * read-only; `viewer`: watches and listens, sends neither camera,
 * microphone nor screen, no laser pointer.
 */
type ModerationRole = 'moderator' | 'presenter' | 'participant' | 'viewer';
/**
 * Roles of the current room, set while the plugin `moderation` is active. A
 * role is a grant signed with the moderator key that every client checks
 * itself - the server never sees roles and cannot forge them. In an
 * unmoderated room `moderated` is `false` and everybody is a `participant`.
 */
interface ModerationApi {
  /** The room link binds a moderator key, or the room is moderated for the running session (`session`) */
  readonly moderated: boolean;
  /** Moderated for the running session only, by a key somebody made while alone in the room; it ends when the room is empty */
  readonly session?: boolean;
  /** This participant holds the moderator key */
  readonly isModerator: boolean;
  /** Own role, `participant` in an unmoderated room */
  readonly role: ModerationRole;
  /** Role of a peer, by a verified grant; `participant` without one */
  roleOf: (peerId?: string) => ModerationRole;
  /** Whether a peer may drive presentations: moderators and presenters in a moderated room, everybody otherwise */
  mayPresent: (peerId?: string) => boolean;
  /**
   * Whether a peer may share: screens and stage documents (whiteboard,
   * editors, watch together, slides, ...). Moderators and presenters in a
   * moderated room, everybody otherwise. Receivers hide screens and
   * documents of a peer that may not share.
   */
  mayShare: (peerId?: string) => boolean;
  /**
   * Whether a peer may manage and edit stage documents: close them, change
   * a synced stage layout, change their content (whiteboard, editors,
   * playback of a video watched together, ...). The same set as `mayShare`:
   * moderators and presenters in a moderated room, everybody otherwise.
   * Receivers ignore what they can attribute to a peer without it (e.g. a
   * document closed by it); content without an authenticated author is
   * protected by the UI only.
   */
  mayEdit: (peerId?: string) => boolean;
  /**
   * Whether this participant may manage and edit stage documents
   * (`mayEdit` of the own peer id). A document plugin asks this one thing
   * and shows its content read-only while it is `false`. Plugins for older
   * hosts read it as `app.state.moderation?.canEdit ?? true`: missing means
   * allowed.
   */
  readonly canEdit: boolean;
  /** Whether a peer may use the laser pointer: everybody but viewers in a moderated room, everybody otherwise. Receivers ignore pointer frames of a peer without it. */
  mayPoint: (peerId?: string) => boolean;
  /** Whether the media of a peer is to be ignored (a viewer in a moderated room) */
  ignoresMediaOf: (peerId?: string) => boolean;
  /**
   * Whether a moderator muted a peer. Receivers do not play its sound;
   * its own client keeps the microphone off. Moderators are never muted.
   */
  isMuted?: (peerId?: string) => boolean;
  /**
   * Whether the sound of a peer is not to be played: a viewer
   * (`ignoresMediaOf`) or muted by a moderator (`isMuted`). Every plugin
   * that plays sound of other participants checks this.
   */
  ignoresAudioOf?: (peerId?: string) => boolean;
  /**
   * A moderator muted this participant: the microphone stays off and may not
   * be switched on (button, shortcut, push-to-talk) until a moderator lifts
   * it. Lifting never switches the microphone on.
   */
  readonly micLocked?: boolean;
}
declare global {
  interface AppState {
    /** Roles of moderated rooms, set while the plugin `moderation` is active */
    moderation?: ModerationApi;
  }
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
  /**
   * Names of plugins this plugin must not run together with, e.g. two
   * providers of the same thing. Declaring it on one side is enough, hosts
   * read it in both directions.
   */
  conflicts?: string[];
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
 * (`name`, `requires`, `conflicts`, `configSchema`, `setup`, `sortWeight`).
 */
declare abstract class AppPluginBase<Context = AppBaseContext> extends PluginBase<Context> {}
/**
 * Keyboard shortcuts, registered with `ctx.addShortcuts()` and dispatched by
 * the `shortcuts` plugin: one listener for the whole app, with the common
 * guards (text fields, open dialogs, IME composition), hold keys, conflict
 * detection, the `?` overview and optional own bindings per user.
 */
/** Pressed and released: push-to-talk, hold-for-laser */
interface AppShortcutHold {
  /** Key went down (once, auto-repeat is swallowed) */
  down: (event: KeyboardEvent) => void;
  /** Key went up - or the window lost focus or was hidden while it was down */
  up: () => void;
}
/**
 * One shortcut. Give either `action` or `hold`.
 *
 * Bindings (`keys`) are written in this notation:
 * `M`, `Shift+M`, `Mod+Shift+M` (`Mod` = ⌘ on Apple, Ctrl
 * elsewhere), `Alt+K`, `Space`, `Escape`, `ArrowRight`, `PageDown`, `?`.
 * A binding without Mod/Ctrl/Alt whose key is a character (letter, digit,
 * symbol, Space) is a "single key": the operator may turn all of those off
 * (`shortcuts.singleKeys`), so important actions should have a chord too.
 */
interface AppShortcut {
  /** Stable id `<plugin>.<name>`, also the key of a user's own binding - never rename */
  id: string;
  /** What it does, as i18n key (shown in the overview) */
  title: string;
  /** Heading it is listed under, as i18n key; default `<plugin>.title` */
  group?: string;
  /** Default bindings, the first one is the main one */
  keys: string | string[];
  /** Runs on key down; auto-repeat only with `repeat` */
  action?: (event: KeyboardEvent) => void;
  /** Runs while the key is held instead of `action` */
  hold?: AppShortcutHold;
  /**
   * The shortcut applies right now, e.g. "in a room" or "my presentation is
   * shown". Called with the event when a key matches (return `false` to let
   * the key through untouched) and without one for listings.
   */
  when?: (event?: KeyboardEvent) => boolean;
  /** Also fires inside text fields (input, textarea, select, contenteditable) - only for chords */
  allowInEditable?: boolean;
  /** Space/Enter also fire while a button, link or other control has the focus (they would activate it) */
  allowOnControls?: boolean;
  /** Holding the key repeats `action` (paging, stepping); default: once per press */
  repeat?: boolean;
  /**
   * Of several shortcuts on the same key, the one with the highest priority
   * whose `when` allows it runs; default 0. Use a higher one for shortcuts that
   * apply only in a narrow situation (a presentation, a focused document), so
   * they win over the general meaning of the key.
   */
  priority?: number;
}
/** A registered shortcut, as kept in `AppGlobalContext.shortcuts` */
interface AppShortcutEntry extends AppShortcut {
  /** The keys, always as list */
  keys: string[];
  /** Name of the plugin that added it */
  pluginName: string;
}
/**
 * Files a stage document type shows (`AppComponent.files`, placement
 * `presentation`). A file dropped on the room window, picked with "Open
 * file" in the stage menu or sent to the stage from the chat opens a new
 * document of a type that takes it; when several do, the participant
 * chooses. A file matches by extension or by MIME type.
 */
interface AppDocumentFiles {
  /** File name extensions, lower case and without the dot, e.g. `['gpx']` */
  extensions?: string[];
  /** MIME types, `video/*` for a whole group. Received files may carry no or a generic type: list the extensions too */
  types?: string[];
  /** Bytes; a larger file is not offered to this document type */
  maxSize?: number;
  /**
   * What opening the file does, as i18n key, shown when several document
   * types take the file (e.g. "Present" and "Fill in" for a PDF). Default:
   * the component's `title`
   */
  action?: string;
}
/** A file as far as matching goes: name, MIME type and size */
interface StageFileInfo {
  name: string;
  type?: string;
  size?: number;
}
/**
 * Showing files on the stage (`state.stageFiles`), provided by the `stage`
 * plugin while in a room. Document components take the file they were
 * opened for with `take(docId)`; other plugins (e.g. the chat) offer
 * "Show on stage" for files `typesFor` knows.
 */
interface StageFilesApi {
  /** Names of the document types that show this file; empty if none, or if the participant may not open documents */
  typesFor: (file: StageFileInfo) => string[];
  /**
   * Opens a new document for the file, of the only matching type or of the
   * one the participant chooses. Resolves the document id, `undefined` if
   * nothing was opened (no match, canceled, document limit, no permission)
   */
  open: (file: File) => Promise<string | undefined>;
  /**
   * For the component of a document opened by `open`: the file to show,
   * once - the next call returns `undefined`. Share it as if the
   * participant had picked it in the document.
   */
  take: (docId?: string) => File | undefined;
}
declare global {
  interface AppState {
    /** Showing files on the stage, set by the `stage` plugin while in a room */
    stageFiles?: StageFilesApi;
  }
}
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
     * The password typed into that prompt, kept while the room entered with
     * it stays empty. A wrong password leads into an empty room of its own,
     * indistinguishable from being the first (by design: nobody can probe
     * whether a room exists), so the empty stage asks to check it. Cleared
     * as soon as anyone else shows up - then the password is proven right.
     */
    roomPasswordEntered?: string;
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
    /** Media handling via the `media` plugin */
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
   * Set by the host, not by the plugin: the component comes from an external
   * plugin (loaded from `/plugins/<id>/`). Hosts use it to fence in markup
   * they do not control, e.g. `stage` shows only a placeholder for a
   * minimized external document.
   */
  readonly external?: boolean;
  /**
   * Only show the component in rooms of these modes, e.g. `['video']` for
   * camera or stage settings that mean nothing in a chat room. Outside a
   * room (`state.roomMode` unset) it is always shown. Default: all modes.
   */
  roomModes?: RoomMode[];
  /**
   * Only show the component while this returns `true`; reactive, read
   * where the components are listed. E.g. a sidebar tab that exists only
   * while something runs. Default: always.
   */
  visible?: () => boolean;
  /**
   * Only for `presentation`: participant thumbnails never cover this
   * document while it is shown large - the stage lays it out beside them,
   * as with the "side by side" setting. For documents with controls at
   * their edges, e.g. a video player.
   */
  keepClear?: boolean;
  /**
   * Only for `presentation`: files this document type shows. Dropped on
   * the room window, picked with "Open file" in the stage menu or sent from
   * the chat, such a file opens a new document of this type; the component
   * takes it with `state.stageFiles.take(docId)`.
   */
  files?: AppDocumentFiles;
}
/** A sidebar tab: needs a `name` and an icon as SVG source */
interface AppComponentSidebar extends AppComponentBasic {
  /** A tab in the sidebar (`sidebar-left` is unused) */
  placement: 'sidebar-left' | 'sidebar-right';
  name: string;
  /** Icon as SVG code */
  iconSvg: string;
  /**
   * The page fills the sidebar height and scrolls its parts itself (e.g. a
   * list above fixed actions). By default the sidebar scrolls the page
   * together with its title, and the page must not scroll itself.
   */
  fixedLayout?: boolean;
}
interface AppComponentSimple extends AppComponentBasic {
  placement:
  /** Global additions outside the routing, like for overlays (beta etc.) */
  'app-addition' |
  /**
   * A document type on the stage (whiteboard, editor, ...). Any number of
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
  /**
   * The room's status area: small pills stacked at the top right of the
   * room, above stage and chat (video and chat rooms, mobile too), e.g. a
   * running timer or the raised hands. For state everybody should notice
   * at a glance, so the toolbar keeps only actions. Gets no props; render
   * nothing while there is nothing to show. The area itself lets pointer
   * events through, the pills take them: use class `room-status-pill` (on a
   * `button` or a `div`) for the standard look. Keep a pill one line high;
   * details belong in a popover or dialog opened from it. Sorted by
   * `sortWeight`, top to bottom. Notices (`ctx.notify`) stack right below
   * the pills.
   */
  'room-status' |
  /** Replace the whole default stage. Must only be one! */
  'stage-container' |
  /**
   * A layer over every video tile (camera or screen, local and remote),
   * e.g. a highlight ring or floating emoji. It covers the whole tile
   * (`inset: 0`) above the video and the avatar, below the name label and
   * the tile buttons, and has `pointer-events: none` (set `auto` on own
   * elements to make them clickable). Gets `StageTileProps`; render nothing
   * for tiles the component does not care about.
   */
  'stage-tile' |
  /**
   * Small inline badges in a video tile's name label, after the name and
   * the mute icon, e.g. a raised hand. Keep them icon-sized (about 14px).
   * Gets `StageTileProps`. While a badge is shown the label stays visible
   * on thumbnails too, where it is otherwise only shown on hover.
   */
  'stage-tile-badge' |
  /**
   * One row of the people list (sidebar `users`), after the name and the
   * microphone/camera state, e.g. a role badge or a menu of actions for
   * this person. Gets `UsersItemProps`. Keep it compact (icon-sized
   * badges, icon buttons): the sidebar is narrow, on a phone a sheet.
   */
  'users-item' |
  /**
   * The people list (sidebar `users`), between the title and the list:
   * notes and actions for everybody in the room, e.g. "ask everyone to
   * mute". Render nothing when there is nothing to say.
   */
  'users-header' |
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
  /**
   * Start page, the group of secondary ways in below the big start button
   * ("Start as chat", ...), drawn as pills. Use class `start-secondary-link`.
   * Used by "pwa" and "direct".
   */
  'welcome-secondary' |
  /**
   * Start page, options for the new room right below the big start button,
   * holding for it and "Start as chat" alike (e.g. "Moderated", plugin
   * `moderation`). To change the room both links open, inject
   * `startRoomSecretKey` (`@/lib/start-room-name`) and replace its password.
   */
  'welcome-options' |
  /** Start page between room name input and footer. Used by "history" plugin. */
  'welcome-middle' |
  /** The top level */
  'room' |
  /**
   * Before entering an audio or video room (`state.lobby` is set): prepare
   * the participant, e.g. camera preview and on/off switches (`media`).
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
  /**
   * - `stage` - the share menu of the stage (`stage` plugin): screens, documents, fullscreen
   * - `camera` - the camera menu (`media` plugin): toolbar button and lobby, below the cameras
   * - `stage-tile` - the menu of one camera or screen tile (`stage` plugin),
   *   local or remote; `items` gets the tile and returns nothing for tiles
   *   it does not care about. Read when the menu opens.
   */
  placement: 'stage' | 'camera' | 'stage-tile';
  /** `tile` is only set for `stage-tile` */
  items: (tile?: StageTileProps) => AppMenuItem[];
  sortWeight?: number;
  roomModes?: RoomMode[];
}
/** The tile a `stage-tile` or `stage-tile-badge` component decorates */
interface StageTileItem {
  /** Id of the tile, stable while the stream is shown */
  id: string;
  /** What the tile shows; the tile placements see only `camera` and `screen` */
  kind: 'camera' | 'screen' | 'document' | 'share' | 'placeholder';
  /** The own camera or screen */
  isLocal: boolean;
  /** The tile stands for a participant (not a document) */
  isVisitor: boolean;
  /** The remote participant, unset for local tiles */
  visitor?: RoomVisitor;
  /** Name the stream is sent under, see `stream-names` */
  streamName?: string;
}
/** Props of `stage-tile` and `stage-tile-badge` components */
interface StageTileProps {
  item: StageTileItem;
  /**
   * The participant the tile belongs to: the remote peer id, or the own
   * `state.room.peerLocalId` on local tiles. Unset while not known yet
   */
  peerId?: string;
  /** Same as `item.isLocal` */
  isLocal: boolean;
  /** Same as `item.streamName`, e.g. `video` for the main camera (`isMainCameraStream`) */
  streamName?: string;
}
/** Props of `users-item` components: one person of the people list */
interface UsersItemProps {
  /**
   * The connections of this person: one peer id per tab or device (a user
   * with several tabs shows once). For the own row `state.room.peerLocalId`;
   * empty while not known yet
   */
  peerIds: string[];
  /** The own row */
  self: boolean;
  /** Display name as the list shows it, unset while unnamed or connecting */
  name?: string;
}
/**
 * A short notice (toast), see `AppPluginContext.notify`. Notices show
 * below the room's status pills (`room-status`), so the two never cover
 * each other; outside a room at the top right, on a phone at the bottom.
 * Something that stays as long as a state lasts (a running timer, a
 * recording) belongs in a `room-status` pill instead.
 */
interface AppNotice {
  /**
   * Notifying again with the same id replaces the shown notice. Unique
   * within the plugin (the app prefixes it with the plugin's name)
   */
  id?: string;
  /** Color and icon; screen readers read `warn` and `error` at once. Default `info` */
  mode?: 'info' | 'success' | 'warn' | 'error';
  /** Translated text, e.g. `ctx.i18n.t(...)` */
  title: string;
  message?: string;
  /**
   * Milliseconds until it closes by itself, `-1` stays until closed. The
   * time pauses while the pointer or the focus is on the notices. Default
   * by mode: success 4 s, info 5 s, warn 8 s, error stays
   */
  timeout?: number;
  /** Without `onCancel` a click on the notice runs it; with, two buttons show */
  onAction?: () => void;
  actionLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  /** The notice is gone, for whatever reason */
  onClose?: () => void;
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
  /** All registered keyboard shortcuts (reactive), see `AppPluginContext.addShortcuts` */
  shortcuts: AppShortcutEntry[];
  i18n: {
    /** Translate an i18n key (`$t` in templates) */
    t: (s: string) => string;
    /** @internal Host hook behind `AppPluginContext.addLocaleMessages` */
    addMessages?: (pluginId: string, locales: PluginLocales) => Promise<void>;
  };
  /** @internal Host hook behind `AppPluginContext.notify`; ids come prefixed */
  notices?: {
    show: (notice: AppNotice & {
      id: string;
    }) => void;
    close: (id: string) => void;
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
  /**
   * Add keyboard shortcuts. They work while the plugin `shortcuts` is on
   * (default), are listed in its overview (`?`) and removed with the plugin
   * or by calling the returned function. Text fields, open dialogs and IME
   * composition are guarded centrally; the key's default (scrolling, a
   * button press) is prevented only when a shortcut runs.
   *
   * @example
   * ```ts
   * ctx.addShortcuts([
   *   { id: 'media.mic', title: 'media.shortcutMic', keys: ['M', 'Mod+Shift+M'], action: () => doToggleMic(), when: () => !!ctx.state.room },
   *   { id: 'pointer.laser', title: 'pointer.shortcutLaser', keys: 'L', hold: { down: () => laser.value = true, up: () => laser.value = false } },
   * ])
   * ```
   */
  addShortcuts: (shortcuts: AppShortcut | AppShortcut[]) => () => void;
  /**
   * Show a short notice (toast) below the room's status pills: something
   * happened ("Time is up", "Anna left"), or needs a decision ("Camera
   * blocked - Try again"). Returns a function that closes it; notices of
   * the plugin also close with it.
   *
   * @example
   * ```ts
   * const close = ctx.notify({ id: 'end', title: ctx.i18n.t(`${pluginName}.end`), timeout: 10000 })
   * ctx.notify({ id: 'failed', mode: 'warn', title, message, timeout: -1, actionLabel: t('retry'), onAction: doRetry, onCancel: () => {} })
   * ```
   */
  notify: (notice: AppNotice) => () => void;
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
/**
 * The laser pointer (plugin `pointer`). Set while the plugin is active.
 * Plugins that show something to point at place a `PointerLayer` over it.
 */
interface PointerApi {
  /** Laser pointer switched on by this participant (stage menu, or `L` held) */
  active: boolean;
  /**
   * The laser points or draws right now (`active`, or `L` or Space held) and
   * this participant may point. A surface with own drag gestures (a map)
   * leaves the pointer to the laser while this is `true`.
   */
  readonly pointing?: boolean;
  /** @internal Implementation behind `PointerLayer` */
  component: Component;
}
declare global {
  interface AppState {
    /** Laser pointer, set while the plugin `pointer` is active */
    pointer?: PointerApi;
  }
}
/** Where a speech-to-text engine stands, see `TranscriberApi.status` */
type TranscriberStatus = 'idle' | 'loading' | 'ready' | 'error';
/** What `TranscriberApi.transcribe` heard */
interface TranscriberResult {
  /** `''` when nothing intelligible was said */
  text: string;
  /** The language transcribed as (ISO 639-1): the one asked for, or the one detected */
  language?: string;
}
/** A speech model the participant may pick, see `TranscriberApi.models` */
interface TranscriberModel {
  id: string;
  /** Name and where it runs, e.g. "Parakeet TDT v3 (CPU)" */
  label: string;
  /** Download in MB, loaded once per browser */
  sizeMb?: number;
}
/**
 * Speech to text in the participant's own browser (`state.transcriber`),
 * provided by an engine plugin (e.g. `com.apperdeck.plugin.transcript`) and
 * used by plugins that write down what is said (`record`: "Write
 * transcript"). The audio never leaves the browser: the engine and its model
 * load from the instance itself.
 */
interface TranscriberApi {
  /** Reactive. `loading` while the model is fetched and compiled */
  readonly status: TranscriberStatus;
  /** Reactive, `0..1` while `loading` (`undefined` when unknown) */
  readonly progress?: number;
  /** Reactive, segments waiting to be transcribed */
  readonly pending: number;
  /** Reactive, what runs once loading started, e.g. "Whisper small (CPU)" */
  readonly label?: string;
  /**
   * Fetch and compile the model ahead of the first `transcribe` (which
   * does it as well). Rejects when the engine cannot run here.
   */
  prepare: () => Promise<void>;
  /**
   * Text of one utterance: mono PCM at `TRANSCRIBER_SAMPLE_RATE`, at most
   * `TRANSCRIBER_MAX_SECONDS` long, in `language` (ISO 639-1) or, without
   * one, in the language the engine detects (which costs extra time).
   * Calls are queued and answered in order.
   */
  transcribe: (pcm: Float32Array, opt?: {
    language?: string;
  }) => Promise<TranscriberResult>;
  /**
   * Reactive, the models this browser can run, for a picker. Absent when
   * the engine offers no choice.
   */
  readonly models?: readonly TranscriberModel[];
  /** Reactive, the id picked with `setModel`; `undefined` = the engine decides */
  readonly model?: string;
  /**
   * Pick the model (`undefined`: the engine decides again), remembered in
   * this browser. Applies from the next `transcribe` once the queue is
   * empty; the new model loads then.
   */
  setModel?: (id?: string) => void;
}
/** Sample rate of the PCM passed to `TranscriberApi.transcribe` */
declare const TRANSCRIBER_SAMPLE_RATE = 16000;
/** Longest utterance `transcribe` takes (the window of Whisper-like models) */
declare const TRANSCRIBER_MAX_SECONDS = 28;
declare global {
  interface AppState {
    /** Speech to text in the browser, set while an engine plugin is active */
    transcriber?: TranscriberApi;
  }
}
/** Get the app context from within a Vue component. Shortcut to the equivalent `inject` call, but with safety net. */
declare function getAppContext(): AppGlobalContext | never;
/**
 * Entries of all sections for a menu, separated by an empty entry; reactive
 * when used inside a `computed`.
 */
declare function menuSectionItems(app: AppGlobalContext, placement: AppMenuSection['placement'], tile?: StageTileProps): AppMenuItem[];
/** Vue computed list of components for a certain placement */
declare function computedComponents(placement: AppComponentPlacement, orderby?: string[]): import("vue").ComputedRef<AppComponent[]>;
/** What `useStorage` of vueuse and plain code need */
interface DeviceStorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}
/**
 * Storage for settings of this device - use it instead of `localStorage`.
 * With vueuse: `useStorage(key, initial, deviceStorage)` instead of
 * `useLocalStorage(key, initial)`.
 */
declare const deviceStorage: DeviceStorageLike;
/** Whether this device remembers settings beyond the tab (reactive) */
declare const deviceRemembered: Readonly<Ref<boolean>>;
interface FileTransportOptions {
  /** How long a request may take before it fails, ms. Default 30 s */
  requestTimeout?: number;
  /** How long to wait for the channel to the sharing peer, ms. Default 15 s */
  connectTimeout?: number;
}
/**
 * Shares files of this tab with the other participants and fetches byte
 * ranges of the files they share, over an encrypted `PeerDataChannel`.
 * Nothing is uploaded: a file stays in the tab that offered it, the others
 * ask for the ranges they need. Put `{ id, owner }` (and whatever else the
 * viewers need, like name and size) into the shared state yourself.
 *
 * @example
 * ```ts
 * ctx.on('appWillEnterRoom', ({ room, dispose }) => {
 *   const transport = setupFileTransport(ctx.state.openDataChannel!(room, { name: pluginName }))
 *   dispose.add(transport.dispose)
 * })
 * // Sharing: const id = transport.offer(file)
 * // Viewing: const bytes = await transport.fetchRange(owner, id, 0, 1024)
 * ```
 */
declare function setupFileTransport(channel: PeerDataChannel, opt?: FileTransportOptions): {
  offer: (file: Blob) => string;
  withdraw: (id: string) => void;
  /** The file behind id `id`, if it is shared from this tab */
  offeredFile: (id: string) => Blob | undefined;
  fetchRange: (peerId: string, id: string, start: number, end: number) => Promise<Uint8Array>;
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
  } & {
    timeout: (fn: TimerExecFunction, timeout?: number) => DisposerFunction;
    interval: (fn: TimerExecFunction, interval?: number) => DisposerFunction;
    intervalPause: (fn: TimerExecFunction, interval?: number) => DisposerFunction;
    on: (emitter: any, eventName: string, fn: (ev?: any) => void, ...args: any[]) => DisposerFunction;
    once: (emitter: any, eventName: string, fn: (ev?: any) => void, ...args: any[]) => DisposerFunction;
  };
};
type FileTransport = ReturnType<typeof setupFileTransport>;
/** Size in pixels */
interface PointerSize {
  width: number;
  height: number;
}
/** Area in pixels, relative to the surface's top left corner */
interface PointerBox extends PointerSize {
  left: number;
  top: number;
}
/** How the content is fitted into its surface, as CSS `object-fit` */
type PointerFit = 'contain' | 'cover' | 'fill';
/**
 * Laser pointer over a surface: place it as the last child of an element
 * with `position: relative` that shows the content (a video, a page). While
 * a participant has the laser pointer on, moving over that element shows a
 * dot to everybody, at the same spot of the content whatever their layout.
 *
 * Renders nothing without the plugin `pointer`.
 *
 * @example
 * ```vue
 * <div class="my-surface" style="position: relative">
 *   <video ref="video" style="object-fit: contain" ... />
 *   <PointerLayer :target="`my-plugin:${docId}`" :media="video" />
 * </div>
 * ```
 *
 * Content the plugin places itself (a map, a zoomable canvas) passes
 * `contentBox`: where the content is drawn right now, in surface pixels.
 * Content coordinates are then 0..1 across that box, the same spot for
 * everybody even when each participant pans and zooms on their own.
 */
declare const PointerLayer: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  /**
   * What is pointed at, the same for every participant (e.g. the document
   * id, plus the page number for paged content). Pointers show only on
   * layers with the same target.
   */
  target: {
    type: StringConstructor;
    required: true;
  };
  /** Element that draws the content; its intrinsic size and `object-fit` place the content in the surface */
  media: {
    type: PropType<HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | null>;
    default: undefined;
  };
  /** Intrinsic size of the content, if there is no `media` element */
  contentSize: {
    type: PropType<PointerSize>;
    default: undefined;
  };
  /** How the content is fitted, default: the `object-fit` of `media`, else `fill` */
  fit: {
    type: PropType<PointerFit>;
    default: undefined;
  };
  /**
   * Where the content is drawn, in pixels relative to the surface; wins
   * over `media`, `contentSize` and `fit`. May be far larger than the
   * surface (a map of the world, zoomed in).
   */
  contentBox: {
    type: PropType<PointerBox>;
    default: undefined;
  };
  /** Content is shown mirrored (e.g. the own camera) */
  mirrored: {
    type: BooleanConstructor;
    default: boolean;
  };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
  [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  /**
   * What is pointed at, the same for every participant (e.g. the document
   * id, plus the page number for paged content). Pointers show only on
   * layers with the same target.
   */
  target: {
    type: StringConstructor;
    required: true;
  };
  /** Element that draws the content; its intrinsic size and `object-fit` place the content in the surface */
  media: {
    type: PropType<HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | null>;
    default: undefined;
  };
  /** Intrinsic size of the content, if there is no `media` element */
  contentSize: {
    type: PropType<PointerSize>;
    default: undefined;
  };
  /** How the content is fitted, default: the `object-fit` of `media`, else `fill` */
  fit: {
    type: PropType<PointerFit>;
    default: undefined;
  };
  /**
   * Where the content is drawn, in pixels relative to the surface; wins
   * over `media`, `contentSize` and `fit`. May be far larger than the
   * surface (a map of the world, zoomed in).
   */
  contentBox: {
    type: PropType<PointerBox>;
    default: undefined;
  };
  /** Content is shown mirrored (e.g. the own camera) */
  mirrored: {
    type: BooleanConstructor;
    default: boolean;
  };
}>> & Readonly<{}>, {
  media: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | null;
  contentSize: PointerSize;
  fit: PointerFit;
  contentBox: PointerBox;
  mirrored: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export { MediaManagerDeviceInfo as $, StageTileItem as A, AppShortcut as B, AppComponentSidebar as C, LogLevelAliasType as Ct, AppNotice as D, AppMenuSection as E, SyncApi as F, BriefingTypeMetaExtensions as G, AppShortcutHold as H, SyncedObject as I, LocaleSource as J, pluginTypeMeta as K, AppDocumentFiles as L, UsersItemProps as M, RoomPanes as N, AppPlugin as O, RoomVisitorState as P, MediaManager as Q, StageFileInfo as R, AppComponentPlacement as S, DisposerFunction as St, AppMenuItem as T, AppPluginBase as U, AppShortcutEntry as V, AppPluginContextApi as W, ModerationApi as X, PluginLocales as Y, ModerationRole as Z, TranscriberResult as _, SendParameters as _t, FileTransportOptions as a, VideoView as at, manifestSchema as b, Type as bt, deviceRemembered as c, PeerDataChannelEvents as ct, menuSectionItems as d, RoomMode as dt, MediaStartOptions as et, getAppContext as f, RoomState as ft, TranscriberModel as g, RoomVisitorEvents as gt, TranscriberApi as h, RoomVisitor as ht, FileTransport as i, AppEmitter as it, StageTileProps as j, AppPluginContext as k, deviceStorage as l, Room as lt, TRANSCRIBER_SAMPLE_RATE as m, PeerStream as mt, PointerFit as n, ProcessedVideoTrack as nt, setupFileTransport as o, OpenPeerDataChannel as ot, TRANSCRIBER_MAX_SECONDS as p, ConnectionRoute as pt, LocaleMessages as q, PointerSize as r, VideoProcessor as rt, DeviceStorageLike as s, PeerDataChannel as st, PointerLayer as t, MediaState as tt, computedComponents as u, RoomEvents as ut, TranscriberStatus as v, TrackStats as vt, AppGlobalContext as w, LoggerInterface as wt, AppComponent as x, UseDisposeWithUtils as xt, PointerApi as y, z_collection_d_exports as yt, StageFilesApi as z };