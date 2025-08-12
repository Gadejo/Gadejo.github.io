var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir4, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env3) {
    return 1;
  }
  hasColors(count4, env3) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process2 extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process2.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd3) {
    this.#cwd = cwd3;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// .wrangler/tmp/pages-YCQnts/functionsWorker-0.6319389083192735.mjs
import { Writable as Writable2 } from "node:stream";
import { EventEmitter as EventEmitter2 } from "node:events";
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
// @__NO_SIDE_EFFECTS__
function createNotImplementedError2(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError2, "createNotImplementedError");
__name2(createNotImplementedError2, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented2(name) {
  const fn = /* @__PURE__ */ __name2(() => {
    throw /* @__PURE__ */ createNotImplementedError2(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented2, "notImplemented");
__name2(notImplemented2, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass2(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass2, "notImplementedClass");
__name2(notImplementedClass2, "notImplementedClass");
var _timeOrigin2 = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow2 = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin2;
var nodeTiming2 = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry2 = class {
  static {
    __name(this, "PerformanceEntry");
  }
  static {
    __name2(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow2();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow2() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark3 = class PerformanceMark22 extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceMark2");
  }
  static {
    __name2(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure2 = class extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceMeasure");
  }
  static {
    __name2(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming2 = class extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  static {
    __name2(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList2 = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  static {
    __name2(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance2 = class {
  static {
    __name(this, "Performance");
  }
  static {
    __name2(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin2;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming2;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming2("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin2) {
      return _performanceNow2();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark3(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure2(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver2 = class {
  static {
    __name(this, "PerformanceObserver");
  }
  static {
    __name2(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError2("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError2("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance2 = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance2();
globalThis.performance = performance2;
globalThis.Performance = Performance2;
globalThis.PerformanceEntry = PerformanceEntry2;
globalThis.PerformanceMark = PerformanceMark3;
globalThis.PerformanceMeasure = PerformanceMeasure2;
globalThis.PerformanceObserver = PerformanceObserver2;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList2;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming2;
var noop_default2 = Object.assign(() => {
}, { __unenv__: true });
var _console2 = globalThis.console;
var _ignoreErrors2 = true;
var _stderr2 = new Writable2();
var _stdout2 = new Writable2();
var log3 = _console2?.log ?? noop_default2;
var info3 = _console2?.info ?? log3;
var trace3 = _console2?.trace ?? info3;
var debug3 = _console2?.debug ?? log3;
var table3 = _console2?.table ?? log3;
var error3 = _console2?.error ?? log3;
var warn3 = _console2?.warn ?? error3;
var createTask3 = _console2?.createTask ?? /* @__PURE__ */ notImplemented2("console.createTask");
var clear3 = _console2?.clear ?? noop_default2;
var count3 = _console2?.count ?? noop_default2;
var countReset3 = _console2?.countReset ?? noop_default2;
var dir3 = _console2?.dir ?? noop_default2;
var dirxml3 = _console2?.dirxml ?? noop_default2;
var group3 = _console2?.group ?? noop_default2;
var groupEnd3 = _console2?.groupEnd ?? noop_default2;
var groupCollapsed3 = _console2?.groupCollapsed ?? noop_default2;
var profile3 = _console2?.profile ?? noop_default2;
var profileEnd3 = _console2?.profileEnd ?? noop_default2;
var time3 = _console2?.time ?? noop_default2;
var timeEnd3 = _console2?.timeEnd ?? noop_default2;
var timeLog3 = _console2?.timeLog ?? noop_default2;
var timeStamp3 = _console2?.timeStamp ?? noop_default2;
var Console2 = _console2?.Console ?? /* @__PURE__ */ notImplementedClass2("console.Console");
var _times2 = /* @__PURE__ */ new Map();
var _stdoutErrorHandler2 = noop_default2;
var _stderrErrorHandler2 = noop_default2;
var workerdConsole2 = globalThis["console"];
var {
  assert: assert3,
  clear: clear22,
  // @ts-expect-error undocumented public API
  context: context2,
  count: count22,
  countReset: countReset22,
  // @ts-expect-error undocumented public API
  createTask: createTask22,
  debug: debug22,
  dir: dir22,
  dirxml: dirxml22,
  error: error22,
  group: group22,
  groupCollapsed: groupCollapsed22,
  groupEnd: groupEnd22,
  info: info22,
  log: log22,
  profile: profile22,
  profileEnd: profileEnd22,
  table: table22,
  time: time22,
  timeEnd: timeEnd22,
  timeLog: timeLog22,
  timeStamp: timeStamp22,
  trace: trace22,
  warn: warn22
} = workerdConsole2;
Object.assign(workerdConsole2, {
  Console: Console2,
  _ignoreErrors: _ignoreErrors2,
  _stderr: _stderr2,
  _stderrErrorHandler: _stderrErrorHandler2,
  _stdout: _stdout2,
  _stdoutErrorHandler: _stdoutErrorHandler2,
  _times: _times2
});
var console_default2 = workerdConsole2;
globalThis.console = console_default2;
var hrtime4 = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name2(/* @__PURE__ */ __name(function hrtime22(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime2"), "hrtime"), { bigint: /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function bigint2() {
  return BigInt(Date.now() * 1e6);
}, "bigint"), "bigint") });
var WriteStream2 = class {
  static {
    __name(this, "WriteStream");
  }
  static {
    __name2(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir32, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env22) {
    return 1;
  }
  hasColors(count32, env22) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};
var ReadStream2 = class {
  static {
    __name(this, "ReadStream");
  }
  static {
    __name2(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};
var NODE_VERSION2 = "22.14.0";
var Process2 = class _Process extends EventEmitter2 {
  static {
    __name(this, "_Process");
  }
  static {
    __name2(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter2.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream2(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream2(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream2(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd22) {
    this.#cwd = cwd22;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION2}`;
  }
  get versions() {
    return { node: NODE_VERSION2 };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError2("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError2("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError2("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError2("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError2("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError2("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError2("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError2("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError2("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError2("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError2("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError2("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError2("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError2("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError2("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError2("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError2("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented2("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented2("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented2("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented2("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented2("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented2("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name2(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
var globalProcess2 = globalThis["process"];
var getBuiltinModule2 = globalProcess2.getBuiltinModule;
var { exit: exit2, platform: platform2, nextTick: nextTick2 } = getBuiltinModule2(
  "node:process"
);
var unenvProcess2 = new Process2({
  env: globalProcess2.env,
  hrtime: hrtime4,
  nextTick: nextTick2
});
var {
  abort: abort2,
  addListener: addListener2,
  allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags2,
  hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback2,
  setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback2,
  loadEnvFile: loadEnvFile2,
  sourceMapsEnabled: sourceMapsEnabled2,
  arch: arch2,
  argv: argv2,
  argv0: argv02,
  chdir: chdir2,
  config: config2,
  connected: connected2,
  constrainedMemory: constrainedMemory2,
  availableMemory: availableMemory2,
  cpuUsage: cpuUsage2,
  cwd: cwd2,
  debugPort: debugPort2,
  dlopen: dlopen2,
  disconnect: disconnect2,
  emit: emit2,
  emitWarning: emitWarning2,
  env: env2,
  eventNames: eventNames2,
  execArgv: execArgv2,
  execPath: execPath2,
  finalization: finalization2,
  features: features2,
  getActiveResourcesInfo: getActiveResourcesInfo2,
  getMaxListeners: getMaxListeners2,
  hrtime: hrtime32,
  kill: kill2,
  listeners: listeners2,
  listenerCount: listenerCount2,
  memoryUsage: memoryUsage2,
  on: on2,
  off: off2,
  once: once2,
  pid: pid2,
  ppid: ppid2,
  prependListener: prependListener2,
  prependOnceListener: prependOnceListener2,
  rawListeners: rawListeners2,
  release: release2,
  removeAllListeners: removeAllListeners2,
  removeListener: removeListener2,
  report: report2,
  resourceUsage: resourceUsage2,
  setMaxListeners: setMaxListeners2,
  setSourceMapsEnabled: setSourceMapsEnabled2,
  stderr: stderr2,
  stdin: stdin2,
  stdout: stdout2,
  title: title2,
  throwDeprecation: throwDeprecation2,
  traceDeprecation: traceDeprecation2,
  umask: umask2,
  uptime: uptime2,
  version: version2,
  versions: versions2,
  domain: domain2,
  initgroups: initgroups2,
  moduleLoadList: moduleLoadList2,
  reallyExit: reallyExit2,
  openStdin: openStdin2,
  assert: assert22,
  binding: binding2,
  send: send2,
  exitCode: exitCode2,
  channel: channel2,
  getegid: getegid2,
  geteuid: geteuid2,
  getgid: getgid2,
  getgroups: getgroups2,
  getuid: getuid2,
  setegid: setegid2,
  seteuid: seteuid2,
  setgid: setgid2,
  setgroups: setgroups2,
  setuid: setuid2,
  permission: permission2,
  mainModule: mainModule2,
  _events: _events2,
  _eventsCount: _eventsCount2,
  _exiting: _exiting2,
  _maxListeners: _maxListeners2,
  _debugEnd: _debugEnd2,
  _debugProcess: _debugProcess2,
  _fatalException: _fatalException2,
  _getActiveHandles: _getActiveHandles2,
  _getActiveRequests: _getActiveRequests2,
  _kill: _kill2,
  _preload_modules: _preload_modules2,
  _rawDebug: _rawDebug2,
  _startProfilerIdleNotifier: _startProfilerIdleNotifier2,
  _stopProfilerIdleNotifier: _stopProfilerIdleNotifier2,
  _tickCallback: _tickCallback2,
  _disconnect: _disconnect2,
  _handleQueue: _handleQueue2,
  _pendingMessage: _pendingMessage2,
  _channel: _channel2,
  _send: _send2,
  _linkedBinding: _linkedBinding2
} = unenvProcess2;
var _process2 = {
  abort: abort2,
  addListener: addListener2,
  allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags2,
  hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback2,
  setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback2,
  loadEnvFile: loadEnvFile2,
  sourceMapsEnabled: sourceMapsEnabled2,
  arch: arch2,
  argv: argv2,
  argv0: argv02,
  chdir: chdir2,
  config: config2,
  connected: connected2,
  constrainedMemory: constrainedMemory2,
  availableMemory: availableMemory2,
  cpuUsage: cpuUsage2,
  cwd: cwd2,
  debugPort: debugPort2,
  dlopen: dlopen2,
  disconnect: disconnect2,
  emit: emit2,
  emitWarning: emitWarning2,
  env: env2,
  eventNames: eventNames2,
  execArgv: execArgv2,
  execPath: execPath2,
  exit: exit2,
  finalization: finalization2,
  features: features2,
  getBuiltinModule: getBuiltinModule2,
  getActiveResourcesInfo: getActiveResourcesInfo2,
  getMaxListeners: getMaxListeners2,
  hrtime: hrtime32,
  kill: kill2,
  listeners: listeners2,
  listenerCount: listenerCount2,
  memoryUsage: memoryUsage2,
  nextTick: nextTick2,
  on: on2,
  off: off2,
  once: once2,
  pid: pid2,
  platform: platform2,
  ppid: ppid2,
  prependListener: prependListener2,
  prependOnceListener: prependOnceListener2,
  rawListeners: rawListeners2,
  release: release2,
  removeAllListeners: removeAllListeners2,
  removeListener: removeListener2,
  report: report2,
  resourceUsage: resourceUsage2,
  setMaxListeners: setMaxListeners2,
  setSourceMapsEnabled: setSourceMapsEnabled2,
  stderr: stderr2,
  stdin: stdin2,
  stdout: stdout2,
  title: title2,
  throwDeprecation: throwDeprecation2,
  traceDeprecation: traceDeprecation2,
  umask: umask2,
  uptime: uptime2,
  version: version2,
  versions: versions2,
  // @ts-expect-error old API
  domain: domain2,
  initgroups: initgroups2,
  moduleLoadList: moduleLoadList2,
  reallyExit: reallyExit2,
  openStdin: openStdin2,
  assert: assert22,
  binding: binding2,
  send: send2,
  exitCode: exitCode2,
  channel: channel2,
  getegid: getegid2,
  geteuid: geteuid2,
  getgid: getgid2,
  getgroups: getgroups2,
  getuid: getuid2,
  setegid: setegid2,
  seteuid: seteuid2,
  setgid: setgid2,
  setgroups: setgroups2,
  setuid: setuid2,
  permission: permission2,
  mainModule: mainModule2,
  _events: _events2,
  _eventsCount: _eventsCount2,
  _exiting: _exiting2,
  _maxListeners: _maxListeners2,
  _debugEnd: _debugEnd2,
  _debugProcess: _debugProcess2,
  _fatalException: _fatalException2,
  _getActiveHandles: _getActiveHandles2,
  _getActiveRequests: _getActiveRequests2,
  _kill: _kill2,
  _preload_modules: _preload_modules2,
  _rawDebug: _rawDebug2,
  _startProfilerIdleNotifier: _startProfilerIdleNotifier2,
  _stopProfilerIdleNotifier: _stopProfilerIdleNotifier2,
  _tickCallback: _tickCallback2,
  _disconnect: _disconnect2,
  _handleQueue: _handleQueue2,
  _pendingMessage: _pendingMessage2,
  _channel: _channel2,
  _send: _send2,
  _linkedBinding: _linkedBinding2
};
var process_default2 = _process2;
globalThis.process = process_default2;
var onRequestPost = /* @__PURE__ */ __name2(async (context22) => {
  const { request, env: env22 } = context22;
  try {
    const body = await request.json();
    const { action, email, password, displayName, token } = body;
    const db = env22.DB;
    switch (action) {
      case "register":
        return await registerUser(db, email, password, displayName);
      case "login":
        return await loginUser(db, email, password, request);
      case "verify":
        return await verifyToken(db, token);
      case "logout":
        return await logoutUser(db, token);
      case "refresh":
        return await refreshToken(db, token);
      case "getUsers":
        return await getRegisteredUsers(db);
      case "switchUser":
        return await switchUser(db, email, password, request);
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error32) {
    console.error("Auth error:", error32);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestPost");
async function registerUser(db, email, password, displayName) {
  if (!email || !password || !displayName) {
    return new Response(JSON.stringify({ error: "Email, password, and display name required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const existingUser = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    await db.prepare(`
        INSERT INTO users (id, email, display_name, password_hash, last_active)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(userId, email.toLowerCase(), displayName, passwordHash).run();
    await db.prepare(`
        INSERT INTO user_profiles (user_id, learning_goals, favorite_subjects, study_schedule)
        VALUES (?, ?, ?, ?)
      `).bind(userId, JSON.stringify([]), JSON.stringify([]), JSON.stringify({})).run();
    return new Response(JSON.stringify({
      success: true,
      userId,
      message: "User registered successfully"
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Registration error:", error32);
    return new Response(JSON.stringify({ error: "Registration failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(registerUser, "registerUser");
__name2(registerUser, "registerUser");
async function loginUser(db, email, password, request) {
  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const user = await db.prepare(`
        SELECT id, email, display_name, password_hash, is_active, avatar_url,
               total_study_time, total_sessions, current_streak, longest_streak
        FROM users 
        WHERE email = ? AND is_active = 1
      `).bind(email.toLowerCase()).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = generateToken();
    const tokenHash = await hashPassword(token);
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const userAgent = request.headers.get("User-Agent") || "";
    const ipAddress = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
    await db.prepare(`
        INSERT INTO user_sessions (id, user_id, token_hash, expires_at, user_agent, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(generateId(), user.id, tokenHash, expiresAt.toISOString(), userAgent, ipAddress).run();
    await db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP, last_active = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id).run();
    const profile32 = await db.prepare("SELECT * FROM user_profiles WHERE user_id = ?").bind(user.id).first();
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        totalStudyTime: user.total_study_time,
        totalSessions: user.total_sessions,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
        level: profile32?.level || 1,
        totalXp: profile32?.total_xp || 0
      },
      token,
      expiresAt: expiresAt.toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Login error:", error32);
    return new Response(JSON.stringify({ error: "Login failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(loginUser, "loginUser");
__name2(loginUser, "loginUser");
async function verifyToken(db, token) {
  if (!token) {
    return new Response(JSON.stringify({ error: "Token required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const tokenHash = await hashPassword(token);
    const session = await db.prepare(`
        SELECT s.user_id, s.expires_at, u.email, u.display_name, u.is_active, u.avatar_url,
               u.total_study_time, u.total_sessions, u.current_streak, u.longest_streak,
               p.level, p.total_xp
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1
      `).bind(tokenHash).first();
    if (!session) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (new Date(session.expires_at) < /* @__PURE__ */ new Date()) {
      await db.prepare("UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?").bind(tokenHash).run();
      return new Response(JSON.stringify({ error: "Token expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    await db.prepare("UPDATE user_sessions SET last_used = CURRENT_TIMESTAMP WHERE token_hash = ?").bind(tokenHash).run();
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: session.user_id,
        email: session.email,
        displayName: session.display_name,
        avatarUrl: session.avatar_url,
        totalStudyTime: session.total_study_time,
        totalSessions: session.total_sessions,
        currentStreak: session.current_streak,
        longestStreak: session.longest_streak,
        level: session.level || 1,
        totalXp: session.total_xp || 0
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Token verification error:", error32);
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(verifyToken, "verifyToken");
__name2(verifyToken, "verifyToken");
async function logoutUser(db, token) {
  if (!token) {
    return new Response(JSON.stringify({ error: "Token required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const tokenHash = await hashPassword(token);
    await db.prepare("UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?").bind(tokenHash).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Logout error:", error32);
    return new Response(JSON.stringify({ error: "Logout failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(logoutUser, "logoutUser");
__name2(logoutUser, "logoutUser");
async function refreshToken(db, token) {
  return await verifyToken(db, token);
}
__name(refreshToken, "refreshToken");
__name2(refreshToken, "refreshToken");
async function getRegisteredUsers(db) {
  try {
    const users = await db.prepare(`
        SELECT id, email, display_name, avatar_url, last_login, 
               total_study_time, total_sessions, current_streak
        FROM users 
        WHERE is_active = 1 
        ORDER BY display_name
      `).all();
    const publicUsers = users.results?.map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      lastLogin: user.last_login,
      totalStudyTime: user.total_study_time || 0,
      totalSessions: user.total_sessions || 0,
      currentStreak: user.current_streak || 0
    })) || [];
    return new Response(JSON.stringify({
      success: true,
      users: publicUsers
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Get users error:", error32);
    return new Response(JSON.stringify({ error: "Failed to get users" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(getRegisteredUsers, "getRegisteredUsers");
__name2(getRegisteredUsers, "getRegisteredUsers");
async function switchUser(db, email, password, request) {
  return await loginUser(db, email, password, request);
}
__name(switchUser, "switchUser");
__name2(switchUser, "switchUser");
function generateId() {
  return "user_" + Date.now() + "_" + Math.random().toString(36).slice(2);
}
__name(generateId, "generateId");
__name2(generateId, "generateId");
function generateToken() {
  return "token_" + Date.now() + "_" + Math.random().toString(36).slice(2) + "_" + Math.random().toString(36).slice(2);
}
__name(generateToken, "generateToken");
__name2(generateToken, "generateToken");
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
__name2(hashPassword, "hashPassword");
async function verifyPassword(password, hash) {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}
__name(verifyPassword, "verifyPassword");
__name2(verifyPassword, "verifyPassword");
var onRequestPost2 = /* @__PURE__ */ __name2(async (context22) => {
  const { request, env: env22 } = context22;
  try {
    const body = await request.json();
    const { action, token, data, id } = body;
    if (!token) {
      if (action === "loadAppData") {
        return new Response(JSON.stringify({
          success: true,
          data: null
          // This will trigger localStorage loading
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ error: "Authentication token required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const db = env22.DB;
    const userId = await verifyTokenAndGetUserId(db, token);
    if (!userId) {
      if (action === "loadAppData") {
        return new Response(JSON.stringify({
          success: true,
          data: null
          // This will trigger localStorage loading
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    switch (action) {
      case "loadAppData":
        return await loadAppData(db, userId);
      case "saveAppData":
        return await saveAppData(db, userId, data);
      case "addSession":
        return await addSession(db, userId, data);
      case "updateSubject":
        return await updateSubject(db, userId, id, data);
      case "addGoal":
        return await addGoal(db, userId, data);
      case "updateGoal":
        return await updateGoal(db, userId, id, data);
      case "deleteGoal":
        return await deleteGoal(db, userId, id);
      case "setPipCount":
        return await setPipCount(db, userId, data);
      case "migrateFromLocalStorage":
        return await migrateFromLocalStorage(db, userId, data);
      case "testMigration":
        return await testMigration(db, userId, data);
      case "ensureUser":
        return await ensureUserExists(db, userId);
      case "diagnostics":
        return await runDiagnostics(db, token, userId);
      case "stepByStepMigration":
        return await stepByStepMigration(db, userId, data);
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error32) {
    console.error("Data operation error:", error32);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestPost");
async function loadAppData(db, userId) {
  try {
    const [subjects, subjectConfigs, sessions, goals, pips, preferences] = await Promise.all([
      db.prepare("SELECT * FROM subjects WHERE user_id = ?").bind(userId).all(),
      db.prepare("SELECT * FROM subject_configs WHERE user_id = ?").bind(userId).all(),
      db.prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC").bind(userId).all(),
      db.prepare("SELECT * FROM goals WHERE user_id = ?").bind(userId).all(),
      db.prepare("SELECT * FROM pips WHERE user_id = ?").bind(userId).all(),
      db.prepare("SELECT preferences FROM users WHERE id = ?").bind(userId).first()
    ]);
    const subjectsData = {};
    subjectConfigs.results?.forEach((config22) => {
      const subjectData = subjects.results?.find((s) => s.id === config22.id);
      subjectsData[config22.id] = {
        config: {
          id: config22.id,
          name: config22.name,
          emoji: config22.emoji,
          color: config22.color,
          achievements: JSON.parse(config22.achievements),
          questTypes: JSON.parse(config22.quest_types),
          pipAmount: config22.pip_amount,
          targetHours: config22.target_hours,
          resources: JSON.parse(config22.resources),
          customFields: JSON.parse(config22.custom_fields || "{}")
        },
        totalMinutes: subjectData?.total_minutes || 0,
        currentStreak: subjectData?.current_streak || 0,
        longestStreak: subjectData?.longest_streak || 0,
        achievementLevel: subjectData?.achievement_level || 0,
        lastStudyDate: subjectData?.last_study_date || null,
        totalXP: subjectData?.total_xp || 0
      };
    });
    const pipsData = {};
    pips.results?.forEach((pip) => {
      if (!pipsData[pip.date]) {
        pipsData[pip.date] = {};
      }
      pipsData[pip.date][pip.subject_id] = pip.count;
    });
    if (Object.keys(subjectsData).length === 0) {
      await initializeDefaultSubjects(db, userId);
      const [newSubjects, newSubjectConfigs] = await Promise.all([
        db.prepare("SELECT * FROM subjects WHERE user_id = ?").bind(userId).all(),
        db.prepare("SELECT * FROM subject_configs WHERE user_id = ?").bind(userId).all()
      ]);
      newSubjectConfigs.results?.forEach((config22) => {
        const subjectData = newSubjects.results?.find((s) => s.id === config22.id);
        subjectsData[config22.id] = {
          config: {
            id: config22.id,
            name: config22.name,
            emoji: config22.emoji,
            color: config22.color,
            achievements: JSON.parse(config22.achievements),
            questTypes: JSON.parse(config22.quest_types),
            pipAmount: config22.pip_amount,
            targetHours: config22.target_hours,
            resources: JSON.parse(config22.resources),
            customFields: JSON.parse(config22.custom_fields || "{}")
          },
          totalMinutes: subjectData?.total_minutes || 0,
          currentStreak: subjectData?.current_streak || 0,
          longestStreak: subjectData?.longest_streak || 0,
          achievementLevel: subjectData?.achievement_level || 0,
          lastStudyDate: subjectData?.last_study_date || null,
          totalXP: subjectData?.total_xp || 0
        };
      });
    }
    const appData = {
      subjects: subjectsData,
      sessions: sessions.results || [],
      goals: goals.results || [],
      pips: pipsData,
      preferences: JSON.parse(preferences?.preferences || '{"dark": false}'),
      version: "4.0.0"
    };
    return new Response(JSON.stringify({ success: true, data: appData }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Load app data error:", error32);
    return new Response(JSON.stringify({ error: "Failed to load data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(loadAppData, "loadAppData");
__name2(loadAppData, "loadAppData");
async function saveAppData(db, userId, appData) {
  try {
    console.log("saveAppData - appData structure:", {
      hasPreferences: !!appData.preferences,
      hasSubjects: !!appData.subjects,
      subjectsType: typeof appData.subjects,
      subjectsKeys: appData.subjects ? Object.keys(appData.subjects) : null
    });
    const operations = [];
    const preferences = appData.preferences || { dark: false };
    operations.push(
      db.prepare("UPDATE users SET preferences = ? WHERE id = ?").bind(JSON.stringify(preferences), userId)
    );
    if (appData.subjects && typeof appData.subjects === "object") {
      for (const [subjectId, subject] of Object.entries(appData.subjects)) {
        console.log("Processing subject:", subjectId, "structure:", Object.keys(subject || {}));
        let config22, subjectData;
        if (subject && typeof subject === "object") {
          if (subject.config) {
            config22 = subject.config;
            subjectData = { ...subject };
            delete subjectData.config;
          } else {
            config22 = subject;
            subjectData = {
              totalMinutes: subject.totalMinutes || 0,
              currentStreak: subject.currentStreak || 0,
              longestStreak: subject.longestStreak || 0,
              achievementLevel: subject.achievementLevel || 0,
              lastStudyDate: subject.lastStudyDate || null,
              totalXP: subject.totalXP || 0
            };
          }
        } else {
          console.warn("Invalid subject data for:", subjectId);
          continue;
        }
        const safeConfig = {
          id: config22.id || subjectId,
          name: config22.name || "Unknown Subject",
          emoji: config22.emoji || "\u{1F4DA}",
          color: config22.color || "#3B82F6",
          pipAmount: config22.pipAmount || 5,
          targetHours: config22.targetHours || 8,
          achievements: config22.achievements || [],
          questTypes: config22.questTypes || ["study"],
          resources: config22.resources || [],
          customFields: config22.customFields || {}
        };
        operations.push(
          db.prepare(`
            INSERT OR REPLACE INTO subject_configs 
            (id, user_id, name, emoji, color, pip_amount, target_hours, achievements, quest_types, resources, custom_fields, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            safeConfig.id,
            userId,
            safeConfig.name,
            safeConfig.emoji,
            safeConfig.color,
            safeConfig.pipAmount,
            safeConfig.targetHours,
            JSON.stringify(safeConfig.achievements),
            JSON.stringify(safeConfig.questTypes),
            JSON.stringify(safeConfig.resources),
            JSON.stringify(safeConfig.customFields)
          )
        );
        operations.push(
          db.prepare(`
            INSERT OR REPLACE INTO subjects 
            (id, user_id, total_minutes, current_streak, longest_streak, achievement_level, last_study_date, total_xp, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            subjectId,
            userId,
            subjectData.totalMinutes || 0,
            subjectData.currentStreak || 0,
            subjectData.longestStreak || 0,
            subjectData.achievementLevel || 0,
            subjectData.lastStudyDate,
            subjectData.totalXP || 0
          )
        );
      }
    }
    await db.batch(operations);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Save app data error:", error32);
    return new Response(JSON.stringify({ error: "Failed to save data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(saveAppData, "saveAppData");
__name2(saveAppData, "saveAppData");
async function addSession(db, userId, session) {
  try {
    await db.prepare(`
      INSERT INTO sessions (id, user_id, subject_id, duration, date, notes, quest_type, xp_earned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      session.id,
      userId,
      session.subjectId,
      session.duration,
      session.date,
      session.notes,
      session.questType,
      session.xpEarned || 0
    ).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Add session error:", error32);
    return new Response(JSON.stringify({ error: "Failed to add session" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(addSession, "addSession");
__name2(addSession, "addSession");
async function updateSubject(db, userId, subjectId, updates) {
  try {
    const setParts = Object.keys(updates).map((key) => {
      const dbKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      return `${dbKey} = ?`;
    });
    const query = `UPDATE subjects SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    const values = [...Object.values(updates), subjectId, userId];
    await db.prepare(query).bind(...values).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Update subject error:", error32);
    return new Response(JSON.stringify({ error: "Failed to update subject" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(updateSubject, "updateSubject");
__name2(updateSubject, "updateSubject");
async function addGoal(db, userId, goal) {
  try {
    await db.prepare(`
      INSERT INTO goals (id, user_id, title, subject_id, type, target, start_date, due_date, priority, done)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      goal.id,
      userId,
      goal.title,
      goal.subjectId,
      goal.type,
      goal.target,
      goal.startDate,
      goal.dueDate,
      goal.priority,
      goal.done ? 1 : 0
    ).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Add goal error:", error32);
    return new Response(JSON.stringify({ error: "Failed to add goal" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(addGoal, "addGoal");
__name2(addGoal, "addGoal");
async function updateGoal(db, userId, goalId, updates) {
  try {
    const setParts = Object.keys(updates).map((key) => {
      const dbKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      return `${dbKey} = ?`;
    });
    const values = Object.values(updates).map(
      (value) => typeof value === "boolean" ? value ? 1 : 0 : value
    );
    const query = `UPDATE goals SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    await db.prepare(query).bind(...values, goalId, userId).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Update goal error:", error32);
    return new Response(JSON.stringify({ error: "Failed to update goal" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(updateGoal, "updateGoal");
__name2(updateGoal, "updateGoal");
async function deleteGoal(db, userId, goalId) {
  try {
    await db.prepare("DELETE FROM goals WHERE id = ? AND user_id = ?").bind(goalId, userId).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Delete goal error:", error32);
    return new Response(JSON.stringify({ error: "Failed to delete goal" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(deleteGoal, "deleteGoal");
__name2(deleteGoal, "deleteGoal");
async function setPipCount(db, userId, pipData) {
  try {
    await db.prepare(`
      INSERT OR REPLACE INTO pips (user_id, date, subject_id, count, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, pipData.date, pipData.subjectId, pipData.count).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Set pip count error:", error32);
    return new Response(JSON.stringify({ error: "Failed to set pip count" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(setPipCount, "setPipCount");
__name2(setPipCount, "setPipCount");
async function migrateFromLocalStorage(db, userId, localStorageData) {
  try {
    const { appData, userTemplates = [] } = localStorageData;
    if (!appData) {
      throw new Error("No app data provided for migration");
    }
    console.log("Starting migration for user:", userId);
    let userExists = await db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").bind(userId).first();
    if (!userExists) {
      console.log("User does not exist in database, attempting to create from token...");
      try {
        const tokenInfo = await db.prepare(`
            SELECT s.user_id, u.email, u.display_name
            FROM user_sessions s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.user_id = ? AND s.is_active = 1
          `).bind(userId).first();
        if (!tokenInfo || !tokenInfo.email) {
          console.log("Creating minimal user record for migration...");
          await db.prepare(`
              INSERT INTO users (id, email, display_name, password_hash, last_active, preferences)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
            `).bind(
            userId,
            `user-${userId}@temp.local`,
            // Temporary email
            "Migrated User",
            "migrated-user-hash",
            // Temporary hash
            JSON.stringify({ dark: false })
          ).run();
          await db.prepare(`
              INSERT INTO user_profiles (user_id, learning_goals, favorite_subjects, study_schedule)
              VALUES (?, ?, ?, ?)
            `).bind(userId, JSON.stringify([]), JSON.stringify([]), JSON.stringify({})).run();
          console.log("Created minimal user record for migration");
          userExists = { id: userId, email: `user-${userId}@temp.local`, display_name: "Migrated User" };
        }
      } catch (createError) {
        console.error("Failed to create user for migration:", createError);
        throw new Error(`User ${userId} does not exist in database and could not be created. Please try registering again.`);
      }
    }
    console.log("User confirmed in database:", userExists);
    console.log("App data keys:", Object.keys(appData));
    console.log("Sessions count:", appData.sessions?.length || 0);
    console.log("Goals count:", appData.goals?.length || 0);
    console.log("Templates count:", userTemplates.length);
    await db.batch([
      db.prepare("DELETE FROM subjects WHERE user_id = ?").bind(userId),
      db.prepare("DELETE FROM subject_configs WHERE user_id = ?").bind(userId),
      db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
      db.prepare("DELETE FROM goals WHERE user_id = ?").bind(userId),
      db.prepare("DELETE FROM pips WHERE user_id = ?").bind(userId),
      db.prepare("DELETE FROM user_templates WHERE user_id = ?").bind(userId)
    ]);
    await saveAppData(db, userId, appData);
    const batchOps = [];
    if (appData.sessions && Array.isArray(appData.sessions)) {
      const sessionOps = appData.sessions.map(
        (session) => db.prepare(`
          INSERT INTO sessions (id, user_id, subject_id, duration, date, notes, quest_type, xp_earned)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          session.id || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          session.subjectId || "",
          session.duration || 0,
          session.date || (/* @__PURE__ */ new Date()).toISOString(),
          session.notes || "",
          session.questType || "study",
          session.xpEarned || 0
        )
      );
      batchOps.push(...sessionOps);
    }
    if (appData.goals && Array.isArray(appData.goals)) {
      const goalOps = appData.goals.map(
        (goal) => db.prepare(`
          INSERT INTO goals (id, user_id, title, subject_id, type, target, start_date, due_date, priority, done)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          goal.id || `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          goal.title || "Untitled Goal",
          goal.subjectId || "",
          goal.type || "minutes",
          goal.target || 0,
          goal.startDate || (/* @__PURE__ */ new Date()).toISOString(),
          goal.dueDate || null,
          goal.priority || "medium",
          goal.done ? 1 : 0
        )
      );
      batchOps.push(...goalOps);
    }
    if (appData.pips && typeof appData.pips === "object") {
      for (const [date, subjectPips] of Object.entries(appData.pips)) {
        if (subjectPips && typeof subjectPips === "object") {
          for (const [subjectId, count32] of Object.entries(subjectPips)) {
            if (typeof count32 === "number" && count32 > 0) {
              batchOps.push(
                db.prepare(`
                  INSERT INTO pips (user_id, date, subject_id, count)
                  VALUES (?, ?, ?, ?)
                `).bind(userId, date, subjectId, count32)
              );
            }
          }
        }
      }
    }
    if (userTemplates && Array.isArray(userTemplates)) {
      const templateOps = userTemplates.map(
        (template) => db.prepare(`
          INSERT INTO user_templates (id, user_id, name, description, category, author, version, subjects, default_goals)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          template.id || `template-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          template.name || "Untitled Template",
          template.description || "",
          template.category || "custom",
          template.author || "User",
          template.version || "1.0.0",
          JSON.stringify(template.subjects || []),
          JSON.stringify(template.defaultGoals || [])
        )
      );
      batchOps.push(...templateOps);
    }
    if (batchOps.length > 0) {
      const batchSize = 25;
      for (let i = 0; i < batchOps.length; i += batchSize) {
        const batch = batchOps.slice(i, i + batchSize);
        await db.batch(batch);
      }
    }
    console.log("Migration completed successfully");
    return new Response(JSON.stringify({ success: true, message: "Migration completed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Migration error:", error32);
    console.error("Error details:", {
      message: error32.message,
      stack: error32.stack,
      localStorageData: localStorageData ? Object.keys(localStorageData) : "null"
    });
    return new Response(JSON.stringify({
      error: "Migration failed",
      details: error32.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(migrateFromLocalStorage, "migrateFromLocalStorage");
__name2(migrateFromLocalStorage, "migrateFromLocalStorage");
async function verifyTokenAndGetUserId(db, token) {
  try {
    const tokenHash = await hashPassword2(token);
    const session = await db.prepare(`
        SELECT s.user_id, s.expires_at, u.is_active
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1
      `).bind(tokenHash).first();
    if (!session) {
      return null;
    }
    if (new Date(session.expires_at) < /* @__PURE__ */ new Date()) {
      await db.prepare("UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?").bind(tokenHash).run();
      return null;
    }
    await db.prepare("UPDATE user_sessions SET last_used = CURRENT_TIMESTAMP WHERE token_hash = ?").bind(tokenHash).run();
    return session.user_id;
  } catch (error32) {
    console.error("Token verification error:", error32);
    return null;
  }
}
__name(verifyTokenAndGetUserId, "verifyTokenAndGetUserId");
__name2(verifyTokenAndGetUserId, "verifyTokenAndGetUserId");
async function testMigration(db, userId, localStorageData) {
  try {
    console.log("Test migration - userId:", userId);
    console.log("Test migration - localStorageData keys:", localStorageData ? Object.keys(localStorageData) : "null");
    const userExists = await db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").bind(userId).first();
    console.log("User exists:", !!userExists);
    if (userExists) {
      console.log("User details:", userExists);
    }
    if (localStorageData?.appData) {
      console.log("Testing saveAppData...");
      await saveAppData(db, userId, localStorageData.appData);
      console.log("saveAppData completed successfully");
    } else {
      console.log("No appData found in localStorageData");
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Test migration completed",
      data: {
        userId,
        userExists: !!userExists,
        userDetails: userExists || null,
        hasAppData: !!localStorageData?.appData,
        appDataKeys: localStorageData?.appData ? Object.keys(localStorageData.appData) : null
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Test migration error:", error32);
    return new Response(JSON.stringify({
      error: "Test migration failed",
      details: error32.message,
      stack: error32.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(testMigration, "testMigration");
__name2(testMigration, "testMigration");
async function stepByStepMigration(db, userId, localStorageData) {
  const steps = {
    step1_data_validation: false,
    step2_user_confirmed: false,
    step3_clear_existing_data: false,
    step4_save_app_data: false,
    step5_save_sessions: false,
    step6_save_goals: false,
    step7_save_pips: false,
    step8_save_templates: false,
    error_at_step: null,
    error_details: null
  };
  try {
    console.log("Step 1: Validating data structure...");
    const { appData, userTemplates = [] } = localStorageData || {};
    if (!appData) {
      throw new Error("No app data provided");
    }
    steps.step1_data_validation = true;
    console.log("\u2713 Data structure valid");
    console.log("Step 2: Confirming user exists...");
    const userExists = await db.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
    if (!userExists) {
      throw new Error("User does not exist");
    }
    steps.step2_user_confirmed = true;
    console.log("\u2713 User confirmed");
    console.log("Step 3: Testing clear operations...");
    await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
    steps.step3_clear_existing_data = true;
    console.log("\u2713 Clear operations work");
    console.log("Step 4: Testing saveAppData...");
    await saveAppData(db, userId, appData);
    steps.step4_save_app_data = true;
    console.log("\u2713 saveAppData works");
    console.log("Step 5: Saving all sessions...");
    const batchOps = [];
    if (appData.sessions && Array.isArray(appData.sessions)) {
      const sessionOps = appData.sessions.map(
        (session) => db.prepare(`
          INSERT INTO sessions (id, user_id, subject_id, duration, date, notes, quest_type, xp_earned)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          session.id || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          session.subjectId || "",
          session.duration || 0,
          session.date || (/* @__PURE__ */ new Date()).toISOString(),
          session.notes || "",
          session.questType || "study",
          session.xpEarned || 0
        )
      );
      batchOps.push(...sessionOps);
    }
    steps.step5_save_sessions = true;
    console.log(`\u2713 Prepared ${batchOps.length} session operations`);
    console.log("Step 6: Saving all goals...");
    if (appData.goals && Array.isArray(appData.goals)) {
      const goalOps = appData.goals.map(
        (goal) => db.prepare(`
          INSERT INTO goals (id, user_id, title, subject_id, type, target, start_date, due_date, priority, done)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          goal.id || `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          goal.title || "Untitled Goal",
          goal.subjectId || "",
          goal.type || "minutes",
          goal.target || 0,
          goal.startDate || (/* @__PURE__ */ new Date()).toISOString(),
          goal.dueDate || null,
          goal.priority || "medium",
          goal.done ? 1 : 0
        )
      );
      batchOps.push(...goalOps);
    }
    steps.step6_save_goals = true;
    console.log(`\u2713 Prepared ${appData.goals?.length || 0} goal operations`);
    console.log("Step 7: Saving pips...");
    if (appData.pips && typeof appData.pips === "object") {
      for (const [date, subjectPips] of Object.entries(appData.pips)) {
        if (subjectPips && typeof subjectPips === "object") {
          for (const [subjectId, count32] of Object.entries(subjectPips)) {
            if (typeof count32 === "number" && count32 > 0) {
              batchOps.push(
                db.prepare(`
                  INSERT INTO pips (user_id, date, subject_id, count)
                  VALUES (?, ?, ?, ?)
                `).bind(userId, date, subjectId, count32)
              );
            }
          }
        }
      }
    }
    steps.step7_save_pips = true;
    console.log("\u2713 Prepared pip operations");
    console.log("Step 8: Saving templates...");
    if (userTemplates && Array.isArray(userTemplates)) {
      const templateOps = userTemplates.map(
        (template) => db.prepare(`
          INSERT INTO user_templates (id, user_id, name, description, category, author, version, subjects, default_goals)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          template.id || `template-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          template.name || "Untitled Template",
          template.description || "",
          template.category || "custom",
          template.author || "User",
          template.version || "1.0.0",
          JSON.stringify(template.subjects || []),
          JSON.stringify(template.defaultGoals || [])
        )
      );
      batchOps.push(...templateOps);
    }
    steps.step8_save_templates = true;
    console.log(`\u2713 Prepared ${userTemplates.length} template operations`);
    console.log(`Executing ${batchOps.length} total operations in batches...`);
    if (batchOps.length > 0) {
      const batchSize = 25;
      for (let i = 0; i < batchOps.length; i += batchSize) {
        const batch = batchOps.slice(i, i + batchSize);
        console.log(`Executing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(batchOps.length / batchSize)} (${batch.length} ops)`);
        await db.batch(batch);
      }
    }
    console.log("\u2713 All operations completed successfully");
    return new Response(JSON.stringify({
      success: true,
      steps,
      message: "Step-by-step migration test completed"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Step-by-step migration error:", error32);
    if (!steps.step1_data_validation) steps.error_at_step = "data_validation";
    else if (!steps.step2_user_confirmed) steps.error_at_step = "user_confirmation";
    else if (!steps.step3_clear_existing_data) steps.error_at_step = "clear_existing_data";
    else if (!steps.step4_save_app_data) steps.error_at_step = "save_app_data";
    else if (!steps.step5_save_sessions) steps.error_at_step = "save_sessions";
    steps.error_details = {
      message: error32.message,
      stack: error32.stack
    };
    return new Response(JSON.stringify({
      success: false,
      steps,
      error: "Step-by-step migration failed",
      failed_at: steps.error_at_step
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(stepByStepMigration, "stepByStepMigration");
__name2(stepByStepMigration, "stepByStepMigration");
async function runDiagnostics(db, token, userId) {
  const results = {
    step1_token_received: !!token,
    step2_userId_extracted: !!userId,
    step3_db_connection: false,
    step4_user_exists: false,
    step5_token_verification: false,
    error_details: null,
    userId_value: userId,
    token_length: token ? token.length : 0
  };
  try {
    console.log("Testing database connection...");
    const dbTest = await db.prepare("SELECT 1 as test").first();
    results.step3_db_connection = !!dbTest;
    console.log("DB connection test:", dbTest);
    console.log("Checking if user exists...");
    const userCheck = await db.prepare("SELECT id, email FROM users WHERE id = ?").bind(userId).first();
    results.step4_user_exists = !!userCheck;
    console.log("User check result:", userCheck);
    console.log("Testing token verification...");
    const tokenHash = await hashPassword2(token);
    const sessionCheck = await db.prepare(`
        SELECT s.user_id, s.expires_at, u.email
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1
      `).bind(tokenHash).first();
    results.step5_token_verification = !!sessionCheck;
    console.log("Token verification result:", sessionCheck);
    return new Response(JSON.stringify({
      success: true,
      diagnostics: results,
      message: "Diagnostics completed"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Diagnostics error:", error32);
    results.error_details = {
      message: error32.message,
      stack: error32.stack
    };
    return new Response(JSON.stringify({
      success: false,
      diagnostics: results,
      error: "Diagnostics failed"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(runDiagnostics, "runDiagnostics");
__name2(runDiagnostics, "runDiagnostics");
async function ensureUserExists(db, userId) {
  try {
    const userExists = await db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").bind(userId).first();
    if (userExists) {
      return new Response(JSON.stringify({
        success: true,
        message: "User already exists",
        user: userExists
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Creating user record for:", userId);
    await db.prepare(`
        INSERT INTO users (id, email, display_name, password_hash, last_active, preferences)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
      `).bind(
      userId,
      `user-${userId}@temp.local`,
      "User",
      "temp-hash",
      JSON.stringify({ dark: false })
    ).run();
    await db.prepare(`
        INSERT INTO user_profiles (user_id, learning_goals, favorite_subjects, study_schedule)
        VALUES (?, ?, ?, ?)
      `).bind(userId, JSON.stringify([]), JSON.stringify([]), JSON.stringify({})).run();
    const newUser = { id: userId, email: `user-${userId}@temp.local`, display_name: "User" };
    return new Response(JSON.stringify({
      success: true,
      message: "User created successfully",
      user: newUser
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Ensure user exists error:", error32);
    return new Response(JSON.stringify({
      error: "Failed to ensure user exists",
      details: error32.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(ensureUserExists, "ensureUserExists");
__name2(ensureUserExists, "ensureUserExists");
async function hashPassword2(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword2, "hashPassword2");
__name2(hashPassword2, "hashPassword");
async function initializeDefaultSubjects(db, userId) {
  const defaultSubjects = [
    {
      id: "japanese",
      name: "Japanese",
      emoji: "\u{1F1EF}\u{1F1F5}",
      color: "#E53E3E",
      pipAmount: 15,
      targetHours: 1,
      questTypes: [
        { id: "easy", name: "Easy", duration: 15, xp: 10, emoji: "\u{1F31F}" },
        { id: "medium", name: "Medium", duration: 30, xp: 25, emoji: "\u26A1" },
        { id: "hard", name: "Hard", duration: 60, xp: 50, emoji: "\u{1F3C6}" }
      ],
      achievements: [
        { id: "first_step", name: "First Step", emoji: "\u{1F31F}", streakRequired: 0 },
        { id: "on_fire", name: "On Fire", emoji: "\u{1F525}", streakRequired: 3 },
        { id: "power_user", name: "Power User", emoji: "\u26A1", streakRequired: 7 },
        { id: "champion", name: "Champion", emoji: "\u{1F3C6}", streakRequired: 14 },
        { id: "master", name: "Master", emoji: "\u{1F48E}", streakRequired: 30 },
        { id: "legend", name: "Legend", emoji: "\u{1F451}", streakRequired: 60 }
      ],
      resources: [
        { id: "1", title: "Tae Kim \u2014 Complete Grammar Guide", url: "https://www.guidetojapanese.org/learn/grammar", priority: "H" },
        { id: "2", title: "NHK Easy News \u2014 Real Japanese", url: "https://www3.nhk.or.jp/news/easy/", priority: "H" },
        { id: "3", title: "Jisho \u2014 Ultimate Dictionary", url: "https://jisho.org/", priority: "H" },
        { id: "4", title: "Anki \u2014 SRS Flashcards", url: "https://apps.ankiweb.net/", priority: "H" }
      ]
    },
    {
      id: "programming",
      name: "Programming",
      emoji: "\u{1F4BB}",
      color: "#38A169",
      pipAmount: 20,
      targetHours: 1.5,
      questTypes: [
        { id: "easy", name: "Easy", duration: 15, xp: 10, emoji: "\u{1F31F}" },
        { id: "medium", name: "Medium", duration: 30, xp: 25, emoji: "\u26A1" },
        { id: "hard", name: "Hard", duration: 60, xp: 50, emoji: "\u{1F3C6}" }
      ],
      achievements: [
        { id: "first_step", name: "First Step", emoji: "\u{1F31F}", streakRequired: 0 },
        { id: "on_fire", name: "On Fire", emoji: "\u{1F525}", streakRequired: 3 },
        { id: "power_user", name: "Power User", emoji: "\u26A1", streakRequired: 7 },
        { id: "champion", name: "Champion", emoji: "\u{1F3C6}", streakRequired: 14 },
        { id: "master", name: "Master", emoji: "\u{1F48E}", streakRequired: 30 },
        { id: "legend", name: "Legend", emoji: "\u{1F451}", streakRequired: 60 }
      ],
      resources: [
        { id: "1", title: "MDN Web Docs", url: "https://developer.mozilla.org/", priority: "H" },
        { id: "2", title: "JavaScript.info", url: "https://javascript.info/", priority: "H" },
        { id: "3", title: "FreeCodeCamp", url: "https://www.freecodecamp.org/", priority: "H" },
        { id: "4", title: "Stack Overflow", url: "https://stackoverflow.com/", priority: "M" }
      ]
    },
    {
      id: "math",
      name: "Mathematics",
      emoji: "\u{1F9EE}",
      color: "#3182CE",
      pipAmount: 25,
      targetHours: 1,
      questTypes: [
        { id: "easy", name: "Easy", duration: 15, xp: 10, emoji: "\u{1F31F}" },
        { id: "medium", name: "Medium", duration: 30, xp: 25, emoji: "\u26A1" },
        { id: "hard", name: "Hard", duration: 60, xp: 50, emoji: "\u{1F3C6}" }
      ],
      achievements: [
        { id: "first_step", name: "First Step", emoji: "\u{1F31F}", streakRequired: 0 },
        { id: "on_fire", name: "On Fire", emoji: "\u{1F525}", streakRequired: 3 },
        { id: "power_user", name: "Power User", emoji: "\u26A1", streakRequired: 7 },
        { id: "champion", name: "Champion", emoji: "\u{1F3C6}", streakRequired: 14 },
        { id: "master", name: "Master", emoji: "\u{1F48E}", streakRequired: 30 },
        { id: "legend", name: "Legend", emoji: "\u{1F451}", streakRequired: 60 }
      ],
      resources: [
        { id: "1", title: "Khan Academy", url: "https://www.khanacademy.org/", priority: "H" },
        { id: "2", title: "Wolfram Alpha", url: "https://www.wolframalpha.com/", priority: "H" },
        { id: "3", title: "Desmos Calculator", url: "https://www.desmos.com/", priority: "M" },
        { id: "4", title: "PatrickJMT", url: "https://patrickjmt.com/", priority: "M" }
      ]
    }
  ];
  for (const subject of defaultSubjects) {
    await db.prepare(`
      INSERT OR IGNORE INTO subject_configs 
      (id, user_id, name, emoji, color, achievements, quest_types, pip_amount, target_hours, resources, custom_fields, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      subject.id,
      userId,
      subject.name,
      subject.emoji,
      subject.color,
      JSON.stringify(subject.achievements),
      JSON.stringify(subject.questTypes),
      subject.pipAmount,
      subject.targetHours,
      JSON.stringify(subject.resources),
      JSON.stringify({})
    ).run();
    await db.prepare(`
      INSERT OR IGNORE INTO subjects 
      (id, user_id, total_minutes, current_streak, longest_streak, achievement_level, last_study_date, total_xp, created_at, updated_at)
      VALUES (?, ?, 0, 0, 0, 0, NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(subject.id, userId).run();
  }
  console.log(`Initialized ${defaultSubjects.length} default subjects for user ${userId}`);
}
__name(initializeDefaultSubjects, "initializeDefaultSubjects");
__name2(initializeDefaultSubjects, "initializeDefaultSubjects");
var onRequestPost3 = /* @__PURE__ */ __name2(async (context22) => {
  const { request, env: env22 } = context22;
  try {
    const body = await request.json();
    const { action, key, data, expirationTtl } = body;
    const sessions = env22.SESSIONS;
    if (!sessions) {
      return new Response(JSON.stringify({
        success: false,
        error: "KV Sessions namespace not available"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    switch (action) {
      case "store":
        if (!key || !data) {
          return new Response(JSON.stringify({
            success: false,
            error: "Key and data required for store operation"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const options = {};
          if (expirationTtl && expirationTtl > 0) {
            options.expirationTtl = expirationTtl;
          }
          await sessions.put(key, JSON.stringify(data), options);
          return new Response(JSON.stringify({
            success: true,
            message: "Session stored successfully"
          }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (error32) {
          console.error("KV store error:", error32);
          return new Response(JSON.stringify({
            success: false,
            error: "Failed to store session"
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      case "get":
        if (!key) {
          return new Response(JSON.stringify({
            success: false,
            error: "Key required for get operation"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const sessionData = await sessions.get(key);
          if (!sessionData) {
            return new Response(JSON.stringify({
              success: false,
              error: "Session not found"
            }), {
              status: 404,
              headers: { "Content-Type": "application/json" }
            });
          }
          return new Response(JSON.stringify({
            success: true,
            data: JSON.parse(sessionData)
          }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (error32) {
          console.error("KV get error:", error32);
          return new Response(JSON.stringify({
            success: false,
            error: "Failed to retrieve session"
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      case "delete":
        if (!key) {
          return new Response(JSON.stringify({
            success: false,
            error: "Key required for delete operation"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          await sessions.delete(key);
          return new Response(JSON.stringify({
            success: true,
            message: "Session deleted successfully"
          }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (error32) {
          console.error("KV delete error:", error32);
          return new Response(JSON.stringify({
            success: false,
            error: "Failed to delete session"
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      case "list":
        try {
          const keys = await sessions.list({ limit: 100 });
          return new Response(JSON.stringify({
            success: true,
            keys: keys.keys.map((k) => k.name)
          }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (error32) {
          console.error("KV list error:", error32);
          return new Response(JSON.stringify({
            success: false,
            error: "Failed to list sessions"
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      default:
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid action"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error32) {
    console.error("KV Session API error:", error32);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestPost");
var onRequestPost4 = /* @__PURE__ */ __name2(async (context22) => {
  const { request, env: env22 } = context22;
  try {
    const body = await request.json();
    const { action, token, settings } = body;
    const db = env22.DB;
    if (!token) {
      if (action === "load") {
        return new Response(JSON.stringify({
          success: true,
          settings: null
          // This will trigger default settings usage
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        success: false,
        error: "Authentication token required"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = await getUserIdFromToken(db, token);
    if (!userId) {
      if (action === "load") {
        return new Response(JSON.stringify({
          success: true,
          settings: null
          // This will trigger default settings usage
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid or expired token"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    switch (action) {
      case "load":
        return await loadUserSettings(db, userId);
      case "save":
        if (!settings) {
          return new Response(JSON.stringify({
            success: false,
            error: "Settings data required"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        return await saveUserSettings(db, userId, settings);
      case "delete":
        return await deleteUserSettings(db, userId);
      default:
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid action"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error32) {
    console.error("Settings API error:", error32);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestPost");
async function getUserIdFromToken(db, token) {
  try {
    const tokenHash = await hashPassword3(token);
    const session = await db.prepare(`
        SELECT s.user_id
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1 AND s.expires_at > CURRENT_TIMESTAMP
      `).bind(tokenHash).first();
    return session?.user_id || null;
  } catch (error32) {
    console.error("Token verification error:", error32);
    return null;
  }
}
__name(getUserIdFromToken, "getUserIdFromToken");
__name2(getUserIdFromToken, "getUserIdFromToken");
async function loadUserSettings(db, userId) {
  try {
    const userSettings = await db.prepare(`
        SELECT theme_preference, language, daily_goal_minutes, weekly_goal_minutes, 
               study_reminders, reminder_times, break_reminders, achievement_notifications,
               weekly_reports, auto_save_interval, pip_notification_sound, quest_complete_sound,
               dashboard_layout, updated_at
        FROM user_settings 
        WHERE user_id = ?
      `).bind(userId).first();
    if (!userSettings) {
      return new Response(JSON.stringify({
        success: true,
        settings: null
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const settings = {
      theme: userSettings.theme_preference || "light",
      language: userSettings.language || "en",
      notifications: {
        studyReminders: userSettings.study_reminders || true,
        achievementAlerts: userSettings.achievement_notifications || true,
        emailDigest: userSettings.weekly_reports || false,
        reminderTimes: userSettings.reminder_times ? JSON.parse(userSettings.reminder_times) : ["09:00", "14:00", "19:00"],
        breakReminders: userSettings.break_reminders || true,
        pipNotificationSound: userSettings.pip_notification_sound || true,
        questCompleteSound: userSettings.quest_complete_sound || true
      },
      dashboard: {
        layout: userSettings.dashboard_layout || "grid",
        showAnimations: true,
        compactView: false
      },
      privacy: {
        shareProgress: false,
        publicProfile: false
      },
      study: {
        defaultPomodoroLength: 25,
        autoStartBreaks: false,
        soundEffects: true,
        dailyGoalMinutes: userSettings.daily_goal_minutes || 60,
        weeklyGoalMinutes: userSettings.weekly_goal_minutes || 420,
        autoSaveInterval: userSettings.auto_save_interval || 300
      }
    };
    return new Response(JSON.stringify({
      success: true,
      settings,
      lastUpdated: userSettings.updated_at
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Load settings error:", error32);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to load settings"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(loadUserSettings, "loadUserSettings");
__name2(loadUserSettings, "loadUserSettings");
async function saveUserSettings(db, userId, settings) {
  try {
    const existing = await db.prepare("SELECT user_id FROM user_settings WHERE user_id = ?").bind(userId).first();
    const settingsData = {
      theme_preference: settings.theme || "light",
      language: settings.language || "en",
      study_reminders: settings.notifications?.studyReminders ? 1 : 0,
      reminder_times: JSON.stringify(settings.notifications?.reminderTimes || ["09:00", "14:00", "19:00"]),
      break_reminders: settings.notifications?.breakReminders ? 1 : 0,
      achievement_notifications: settings.notifications?.achievementAlerts ? 1 : 0,
      weekly_reports: settings.notifications?.emailDigest ? 1 : 0,
      auto_save_interval: settings.study?.autoSaveInterval || 300,
      pip_notification_sound: settings.notifications?.pipNotificationSound ? 1 : 0,
      quest_complete_sound: settings.notifications?.questCompleteSound ? 1 : 0,
      daily_goal_minutes: settings.study?.dailyGoalMinutes || 60,
      weekly_goal_minutes: settings.study?.weeklyGoalMinutes || 420,
      dashboard_layout: settings.dashboard?.layout || "grid"
    };
    if (existing) {
      await db.prepare(`
          UPDATE user_settings 
          SET theme_preference = ?, language = ?, study_reminders = ?, reminder_times = ?, 
              break_reminders = ?, achievement_notifications = ?, weekly_reports = ?,
              auto_save_interval = ?, pip_notification_sound = ?, quest_complete_sound = ?,
              daily_goal_minutes = ?, weekly_goal_minutes = ?, dashboard_layout = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).bind(
        settingsData.theme_preference,
        settingsData.language,
        settingsData.study_reminders,
        settingsData.reminder_times,
        settingsData.break_reminders,
        settingsData.achievement_notifications,
        settingsData.weekly_reports,
        settingsData.auto_save_interval,
        settingsData.pip_notification_sound,
        settingsData.quest_complete_sound,
        settingsData.daily_goal_minutes,
        settingsData.weekly_goal_minutes,
        settingsData.dashboard_layout,
        userId
      ).run();
    } else {
      await db.prepare(`
          INSERT INTO user_settings (
            user_id, theme_preference, language, study_reminders, reminder_times, 
            break_reminders, achievement_notifications, weekly_reports, auto_save_interval, 
            pip_notification_sound, quest_complete_sound, daily_goal_minutes, 
            weekly_goal_minutes, dashboard_layout
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
        userId,
        settingsData.theme_preference,
        settingsData.language,
        settingsData.study_reminders,
        settingsData.reminder_times,
        settingsData.break_reminders,
        settingsData.achievement_notifications,
        settingsData.weekly_reports,
        settingsData.auto_save_interval,
        settingsData.pip_notification_sound,
        settingsData.quest_complete_sound,
        settingsData.daily_goal_minutes,
        settingsData.weekly_goal_minutes,
        settingsData.dashboard_layout
      ).run();
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Settings saved successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Save settings error:", error32);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to save settings"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(saveUserSettings, "saveUserSettings");
__name2(saveUserSettings, "saveUserSettings");
async function deleteUserSettings(db, userId) {
  try {
    await db.prepare("DELETE FROM user_settings WHERE user_id = ?").bind(userId).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Settings deleted successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Delete settings error:", error32);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to delete settings"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(deleteUserSettings, "deleteUserSettings");
__name2(deleteUserSettings, "deleteUserSettings");
async function hashPassword3(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword3, "hashPassword3");
__name2(hashPassword3, "hashPassword");
var onRequestPost5 = /* @__PURE__ */ __name2(async (context22) => {
  const { request, env: env22 } = context22;
  try {
    const body = await request.json();
    const { action, token, template, templateId } = body;
    if (!token) {
      return new Response(JSON.stringify({ error: "Authentication token required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const db = env22.DB;
    const userId = await verifyTokenAndGetUserId2(db, token);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    switch (action) {
      case "loadUserTemplates":
        return await loadUserTemplates(db, userId);
      case "saveUserTemplate":
        return await saveUserTemplate(db, userId, template);
      case "deleteUserTemplate":
        return await deleteUserTemplate(db, userId, templateId);
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error32) {
    console.error("Template operation error:", error32);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestPost");
async function loadUserTemplates(db, userId) {
  try {
    const result = await db.prepare("SELECT * FROM user_templates WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
    const templates = result.results?.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      author: template.author,
      version: template.version,
      subjects: JSON.parse(template.subjects),
      defaultGoals: JSON.parse(template.default_goals)
    })) || [];
    return new Response(JSON.stringify({ success: true, templates }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Load user templates error:", error32);
    return new Response(JSON.stringify({ error: "Failed to load templates" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(loadUserTemplates, "loadUserTemplates");
__name2(loadUserTemplates, "loadUserTemplates");
async function saveUserTemplate(db, userId, template) {
  try {
    await db.prepare(`
      INSERT OR REPLACE INTO user_templates 
      (id, user_id, name, description, category, author, version, subjects, default_goals, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      template.id,
      userId,
      template.name,
      template.description,
      template.category,
      template.author,
      template.version,
      JSON.stringify(template.subjects),
      JSON.stringify(template.defaultGoals || [])
    ).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Save user template error:", error32);
    return new Response(JSON.stringify({ error: "Failed to save template" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(saveUserTemplate, "saveUserTemplate");
__name2(saveUserTemplate, "saveUserTemplate");
async function deleteUserTemplate(db, userId, templateId) {
  try {
    await db.prepare("DELETE FROM user_templates WHERE id = ? AND user_id = ?").bind(templateId, userId).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error32) {
    console.error("Delete user template error:", error32);
    return new Response(JSON.stringify({ error: "Failed to delete template" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(deleteUserTemplate, "deleteUserTemplate");
__name2(deleteUserTemplate, "deleteUserTemplate");
async function verifyTokenAndGetUserId2(db, token) {
  try {
    const tokenHash = await hashPassword4(token);
    const session = await db.prepare(`
        SELECT s.user_id, s.expires_at, u.is_active
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1
      `).bind(tokenHash).first();
    if (!session) {
      return null;
    }
    if (new Date(session.expires_at) < /* @__PURE__ */ new Date()) {
      await db.prepare("UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?").bind(tokenHash).run();
      return null;
    }
    await db.prepare("UPDATE user_sessions SET last_used = CURRENT_TIMESTAMP WHERE token_hash = ?").bind(tokenHash).run();
    return session.user_id;
  } catch (error32) {
    console.error("Token verification error:", error32);
    return null;
  }
}
__name(verifyTokenAndGetUserId2, "verifyTokenAndGetUserId2");
__name2(verifyTokenAndGetUserId2, "verifyTokenAndGetUserId");
async function hashPassword4(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword4, "hashPassword4");
__name2(hashPassword4, "hashPassword");
var onRequest = /* @__PURE__ */ __name2(async (context22) => {
  const { request, env: env22 } = context22;
  const url = new URL(request.url);
  const clientIP = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
  const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  };
  if (url.pathname.startsWith("/api/")) {
    const rateLimitKey = `rate_limit:${clientIP}`;
    const rateLimitWindow = parseInt(env22.RATE_LIMIT_WINDOW);
    const rateLimitRequests = parseInt(env22.RATE_LIMIT_REQUESTS);
    try {
      const currentCount2 = await env22.RATE_LIMIT.get(rateLimitKey);
      const count4 = currentCount2 ? parseInt(currentCount2) : 0;
      if (count4 >= rateLimitRequests) {
        return new Response(JSON.stringify({
          error: "Rate limit exceeded",
          resetTime: Date.now() + rateLimitWindow * 1e3
        }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateLimitWindow.toString(),
            ...securityHeaders
          }
        });
      }
      await env22.RATE_LIMIT.put(rateLimitKey, (count4 + 1).toString(), {
        expirationTtl: rateLimitWindow
      });
    } catch (error32) {
      console.error("Rate limiting error:", error32);
    }
    const response2 = await context22.next();
    const newResponse2 = new Response(response2.body, response2);
    newResponse2.headers.set("Access-Control-Allow-Origin", "*");
    newResponse2.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    newResponse2.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    newResponse2.headers.set("Access-Control-Max-Age", "86400");
    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse2.headers.set(key, value);
    });
    const currentCount = await env22.RATE_LIMIT.get(rateLimitKey);
    const count32 = currentCount ? parseInt(currentCount) : 0;
    newResponse2.headers.set("X-RateLimit-Limit", rateLimitRequests.toString());
    newResponse2.headers.set("X-RateLimit-Remaining", Math.max(0, rateLimitRequests - count32).toString());
    newResponse2.headers.set("X-RateLimit-Reset", (Date.now() + rateLimitWindow * 1e3).toString());
    return newResponse2;
  }
  if (env22.NODE_ENV === "production" && (url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname.endsWith(".png") || url.pathname.endsWith(".jpg") || url.pathname.endsWith(".svg") || url.pathname.endsWith(".ico"))) {
    const response2 = await context22.next();
    const newResponse2 = new Response(response2.body, response2);
    newResponse2.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse2.headers.set(key, value);
    });
    return newResponse2;
  }
  const response = await context22.next();
  const newResponse = new Response(response.body, response);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}, "onRequest");
var onRequestOptions = /* @__PURE__ */ __name2(async ({ env: env22 }) => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY"
    }
  });
}, "onRequestOptions");
var routes = [
  {
    routePath: "/api/auth",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/data",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/kv-session",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/templates",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "OPTIONS",
    middlewares: [onRequestOptions],
    modules: []
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest],
    modules: []
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count32 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count32--;
          if (count32 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count32++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count32)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env22, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context22 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env22,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context22);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env22["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error32) {
      if (isFailOpen) {
        const response = await env22["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error32;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env22, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env22);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env22, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env22);
  } catch (e) {
    const error32 = reduceError(e);
    return Response.json(error32, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env22, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env22, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env22, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env22, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env22, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env22, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env22, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env22, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env22, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env22, ctx) => {
      this.env = env22;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env3, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env3);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env3, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env3);
  } catch (e) {
    const error4 = reduceError2(e);
    return Response.json(error4, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-YlpBru/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env3, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env3, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env3, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env3, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-YlpBru/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env3, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env3, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env3, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env3, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env3, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env3, ctx) => {
      this.env = env3;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.6319389083192735.js.map
