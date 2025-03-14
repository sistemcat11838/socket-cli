import { realpathSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import registryConstants from '@socketsecurity/registry/lib/constants'
import { envAsBoolean } from '@socketsecurity/registry/lib/env'

import type { Remap } from '@socketsecurity/registry/lib/objects'

const {
  NODE_MODULES,
  NPM,
  NPX,
  PACKAGE_JSON,
  SOCKET_SECURITY_SCOPE,
  kInternalsSymbol,
  [kInternalsSymbol as unknown as 'Symbol(kInternalsSymbol)']: {
    createConstantsObject
  }
} = registryConstants

type RegistryEnv = typeof registryConstants.ENV

type RegistryInternals = (typeof registryConstants)['Symbol(kInternalsSymbol)']

type Sentry = any

type Internals = Remap<
  Omit<RegistryInternals, 'getIPC'> &
    Readonly<{
      getIPC: {
        (): Promise<IPC>
        <K extends keyof IPC | undefined>(
          key?: K | undefined
        ): Promise<K extends keyof IPC ? IPC[K] : IPC>
      }
      getSentry: () => Sentry
      setSentry(Sentry: Sentry): boolean
    }>
>

type ENV = Remap<
  RegistryEnv &
    Readonly<{
      SOCKET_CLI_DEBUG: boolean
      SOCKET_CLI_LEGACY_BUILD: boolean
      SOCKET_CLI_NO_API_TOKEN: boolean
      SOCKET_CLI_PUBLISHED_BUILD: boolean
      SOCKET_CLI_SENTRY_BUILD: boolean
      SOCKET_CLI_VERSION_HASH: string
    }>
>

type IPC = Readonly<{
  SOCKET_CLI_FIX?: string | undefined
  SOCKET_CLI_OPTIMIZE?: boolean | undefined
  SOCKET_CLI_SAFE_WRAPPER?: number | undefined
}>

type Constants = Remap<
  Omit<typeof registryConstants, 'Symbol(kInternalsSymbol)' | 'ENV' | 'IPC'> & {
    readonly 'Symbol(kInternalsSymbol)': Internals
    readonly ALERT_TYPE_CRITICAL_CVE: 'criticalCVE'
    readonly ALERT_TYPE_CVE: 'cve'
    readonly ALERT_TYPE_MEDIUM_CVE: 'mediumCVE'
    readonly ALERT_TYPE_MILD_CVE: 'mildCVE'
    readonly ALERT_TYPE_SOCKET_UPGRADE_AVAILABLE: 'socketUpgradeAvailable'
    readonly API_V0_URL: 'https://api.socket.dev/v0'
    readonly BATCH_PURL_ENDPOINT: 'https://api.socket.dev/v0/purl?alerts=true&compact=true'
    readonly BINARY_LOCK_EXT: '.lockb'
    readonly BUN: 'bun'
    readonly CLI: 'cli'
    readonly CVE_ALERT_PROPS_FIRST_PATCHED_VERSION_IDENTIFIER: 'firstPatchedVersionIdentifier'
    readonly CVE_ALERT_PROPS_VULNERABLE_VERSION_RANGE: 'vulnerableVersionRange'
    readonly ENV: ENV
    readonly DIST_TYPE: 'module-sync' | 'require'
    readonly DRY_RUN_LABEL: '[DryRun]'
    readonly DRY_RUN_BAIL_TEXT: '[DryRun] Bailing now'
    readonly IPC: IPC
    readonly LOCK_EXT: '.lock'
    readonly MODULE_SYNC: 'module-sync'
    readonly NPM_REGISTRY_URL: 'https://registry.npmjs.org'
    readonly PNPM: 'pnpm'
    readonly REDACTED: '<redacted>'
    readonly REQUIRE: 'require'
    readonly SHADOW_NPM_BIN: 'shadow-bin'
    readonly SHADOW_NPM_INJECT: 'shadow-npm-inject'
    readonly SHADOW_NPM_PATHS: 'shadow-npm-paths'
    readonly SOCKET: 'socket'
    readonly SOCKET_CLI_BIN_NAME: 'socket'
    readonly SOCKET_CLI_BIN_NAME_ALIAS: 'cli'
    readonly SOCKET_CLI_DEBUG: 'SOCKET_CLI_DEBUG'
    readonly SOCKET_CLI_FIX: 'SOCKET_CLI_FIX'
    readonly SOCKET_CLI_ISSUES_URL: 'https://github.com/SocketDev/socket-cli/issues'
    readonly SOCKET_CLI_SENTRY_BIN_NAME_ALIAS: 'cli-with-sentry'
    readonly SOCKET_CLI_LEGACY_BUILD: 'SOCKET_CLI_LEGACY_BUILD'
    readonly SOCKET_CLI_LEGACY_PACKAGE_NAME: '@socketsecurity/cli'
    readonly SOCKET_CLI_NO_API_TOKEN: 'SOCKET_CLI_NO_API_TOKEN'
    readonly SOCKET_CLI_NPM_BIN_NAME: 'socket-npm'
    readonly SOCKET_CLI_NPX_BIN_NAME: 'socket-npx'
    readonly SOCKET_CLI_OPTIMIZE: 'SOCKET_CLI_OPTIMIZE'
    readonly SOCKET_CLI_PACKAGE_NAME: 'socket'
    readonly SOCKET_CLI_PUBLISHED_BUILD: 'SOCKET_CLI_PUBLISHED_BUILD'
    readonly SOCKET_CLI_SAFE_WRAPPER: 'SOCKET_CLI_SAFE_WRAPPER'
    readonly SOCKET_CLI_SENTRY_BIN_NAME: 'socket-with-sentry'
    readonly SOCKET_CLI_SENTRY_BUILD: 'SOCKET_CLI_SENTRY_BUILD'
    readonly SOCKET_CLI_SENTRY_NPM_BIN_NAME: 'socket-npm-with-sentry'
    readonly SOCKET_CLI_SENTRY_NPX_BIN_NAME: 'socket-npx-with-sentry'
    readonly SOCKET_CLI_SENTRY_PACKAGE_NAME: '@socketsecurity/cli-with-sentry'
    readonly SOCKET_CLI_VERSION_HASH: 'SOCKET_CLI_VERSION_HASH'
    readonly VLT: 'vlt'
    readonly WITH_SENTRY: 'with-sentry'
    readonly YARN: 'yarn'
    readonly YARN_BERRY: 'yarn/berry'
    readonly YARN_CLASSIC: 'yarn/classic'
    readonly bashRcPath: string
    readonly distCliPath: string
    readonly distInstrumentWithSentryPath: string
    readonly distPath: string
    readonly distShadowNpmBinPath: string
    readonly distShadowNpmInjectPath: string
    readonly homePath: string
    readonly nmBinPath: string
    readonly rootBinPath: string
    readonly rootDistPath: string
    readonly rootPath: string
    readonly rootPkgJsonPath: string
    readonly shadowBinPath: string
    readonly zshRcPath: string
  }
>

const SOCKET = 'socket'
const WITH_SENTRY = 'with-sentry'

const ALERT_TYPE_CRITICAL_CVE = 'criticalCVE'
const ALERT_TYPE_CVE = 'cve'
const ALERT_TYPE_MEDIUM_CVE = 'mediumCVE'
const ALERT_TYPE_MILD_CVE = 'mildCVE'
const ALERT_TYPE_SOCKET_UPGRADE_AVAILABLE = 'socketUpgradeAvailable'
const API_V0_URL = 'https://api.socket.dev/v0'
const BINARY_LOCK_EXT = '.lockb'
const BUN = 'bun'
const CLI = 'cli'
const CVE_ALERT_PROPS_FIRST_PATCHED_VERSION_IDENTIFIER =
  'firstPatchedVersionIdentifier'
const CVE_ALERT_PROPS_VULNERABLE_VERSION_RANGE = 'vulnerableVersionRange'
const DRY_RUN_LABEL = '[DryRun]'
const DRY_RUN_BAIL_TEXT = `${DRY_RUN_LABEL}: Bailing now`
const LOCK_EXT = '.lock'
const MODULE_SYNC = 'module-sync'
const NPM_REGISTRY_URL = 'https://registry.npmjs.org'
const PNPM = 'pnpm'
const REDACTED = '<redacted>'
const REQUIRE = 'require'
const SHADOW_NPM_BIN = 'shadow-bin'
const SHADOW_NPM_INJECT = 'shadow-npm-inject'
const SHADOW_NPM_PATHS = 'shadow-npm-paths'
const SOCKET_CLI_BIN_NAME = SOCKET
const SOCKET_CLI_BIN_NAME_ALIAS = CLI
const SOCKET_CLI_DEBUG = 'SOCKET_CLI_DEBUG'
const SOCKET_CLI_FIX = 'SOCKET_CLI_FIX'
const SOCKET_CLI_ISSUES_URL = 'https://github.com/SocketDev/socket-cli/issues'
const SOCKET_CLI_LEGACY_BUILD = 'SOCKET_CLI_LEGACY_BUILD'
const SOCKET_CLI_LEGACY_PACKAGE_NAME = `${SOCKET_SECURITY_SCOPE}/${CLI}`
const SOCKET_CLI_NO_API_TOKEN = 'SOCKET_CLI_NO_API_TOKEN'
const SOCKET_CLI_OPTIMIZE = 'SOCKET_CLI_OPTIMIZE'
const SOCKET_CLI_NPM_BIN_NAME = `${SOCKET}-${NPM}`
const SOCKET_CLI_NPX_BIN_NAME = `${SOCKET}-${NPX}`
const SOCKET_CLI_PACKAGE_NAME = SOCKET
const SOCKET_CLI_PUBLISHED_BUILD = 'SOCKET_CLI_PUBLISHED_BUILD'
const SOCKET_CLI_SAFE_WRAPPER = 'SOCKET_CLI_SAFE_WRAPPER'
const SOCKET_CLI_SENTRY_BIN_NAME = `${SOCKET_CLI_BIN_NAME}-${WITH_SENTRY}`
const SOCKET_CLI_SENTRY_BIN_NAME_ALIAS = `${SOCKET_CLI_BIN_NAME_ALIAS}-${WITH_SENTRY}`
const SOCKET_CLI_SENTRY_BUILD = 'SOCKET_CLI_SENTRY_BUILD'
const SOCKET_CLI_SENTRY_NPM_BIN_NAME = `${SOCKET_CLI_NPM_BIN_NAME}-${WITH_SENTRY}`
const SOCKET_CLI_SENTRY_NPX_BIN_NAME = `${SOCKET_CLI_NPX_BIN_NAME}-${WITH_SENTRY}`
const SOCKET_CLI_SENTRY_PACKAGE_NAME = `${SOCKET_CLI_LEGACY_PACKAGE_NAME}-${WITH_SENTRY}`
const SOCKET_CLI_VERSION_HASH = 'SOCKET_CLI_VERSION_HASH'
const VLT = 'vlt'
const YARN = 'yarn'
const YARN_BERRY = `${YARN}/berry`
const YARN_CLASSIC = `${YARN}/classic`

let _Sentry: any

const LAZY_BATCH_PURL_ENDPOINT = () => {
  const query = new URLSearchParams()
  query.append('alerts', 'true')
  query.append('compact', 'true')
  return `${API_V0_URL}/purl?${query}`
}

const LAZY_DIST_TYPE = () =>
  registryConstants.SUPPORTS_NODE_REQUIRE_MODULE ? MODULE_SYNC : REQUIRE

const LAZY_ENV = () => {
  const { env } = process
  // We inline some environment values so that they CANNOT be influenced by user
  // provided environment variables.
  return Object.freeze({
    // Lazily access registryConstants.ENV.
    ...registryConstants.ENV,
    // Flag set to help debug Socket CLI.
    [SOCKET_CLI_DEBUG]: envAsBoolean(env[SOCKET_CLI_DEBUG]),
    // Inlined flag set to determine if this is the Legacy build.
    // The '@rollup/plugin-replace' will replace "process.env[SOCKET_CLI_LEGACY_BUILD]".
    [SOCKET_CLI_LEGACY_BUILD]: process.env[SOCKET_CLI_LEGACY_BUILD],
    // Flag set to make the default API token `undefined`.
    [SOCKET_CLI_NO_API_TOKEN]: envAsBoolean(env[SOCKET_CLI_NO_API_TOKEN]),
    // Inlined flag set to determine if this is a published build.
    // The '@rollup/plugin-replace' will replace "process.env[SOCKET_CLI_PUBLISHED_BUILD]".
    [SOCKET_CLI_PUBLISHED_BUILD]: process.env[SOCKET_CLI_PUBLISHED_BUILD],
    // Inlined flag set to determine if this is the Sentry build.
    // The '@rollup/plugin-replace' will replace "process.env[SOCKET_CLI_SENTRY_BUILD]".
    [SOCKET_CLI_SENTRY_BUILD]: process.env[SOCKET_CLI_SENTRY_BUILD],
    // Inlined flag set to determine the version hash of the build.
    // The '@rollup/plugin-replace' will replace "process.env[SOCKET_CLI_VERSION_HASH]".
    [SOCKET_CLI_VERSION_HASH]: process.env[SOCKET_CLI_VERSION_HASH]
  })
}

const lazyBashRcPath = () =>
  // Lazily access constants.homePath.
  path.join(constants.homePath, '.bashrc')

const lazyDistCliPath = () =>
  // Lazily access constants.distPath.
  path.join(constants.distPath, 'cli.js')

const lazyDistInstrumentWithSentryPath = () =>
  // Lazily access constants.rootDistPath.
  path.join(constants.rootDistPath, 'instrument-with-sentry.js')

const lazyDistPath = () =>
  // Lazily access constants.rootDistPath and constants.DIST_TYPE.
  path.join(constants.rootDistPath, constants.DIST_TYPE)

const lazyDistShadowNpmBinPath = () =>
  // Lazily access constants.distPath.
  path.join(constants.distPath, `${SHADOW_NPM_BIN}.js`)

const lazyDistShadowNpmInjectPath = () =>
  // Lazily access constants.distPath.
  path.join(constants.distPath, `${SHADOW_NPM_INJECT}.js`)

const lazyHomePath = () => os.homedir()

const lazyNmBinPath = () =>
  // Lazily access constants.rootPath.
  path.join(constants.rootPath, `${NODE_MODULES}/.bin`)

const lazyRootBinPath = () =>
  // Lazily access constants.rootPath.
  path.join(constants.rootPath, 'bin')

const lazyRootDistPath = () =>
  // Lazily access constants.rootPath.
  path.join(constants.rootPath, 'dist')

const lazyRootPath = () =>
  // The '@rollup/plugin-replace' will replace "process.env.['VITEST']" with `false` and
  // it will be dead code eliminated by Rollup.
  path.join(
    realpathSync.native(__dirname),
    process.env['SOCKET_CLI_TEST_DIST_BUILD'] ? '../..' : '..'
  )

const lazyRootPkgJsonPath = () =>
  // Lazily access constants.rootPath.
  path.join(constants.rootPath, PACKAGE_JSON)

const lazyShadowBinPath = () =>
  // Lazily access constants.rootPath.
  path.join(constants.rootPath, SHADOW_NPM_BIN)

const lazyZshRcPath = () =>
  // Lazily access constants.homePath.
  path.join(constants.homePath, '.zshrc')

const constants = <Constants>createConstantsObject(
  {
    ALERT_TYPE_CRITICAL_CVE,
    ALERT_TYPE_CVE,
    ALERT_TYPE_MEDIUM_CVE,
    ALERT_TYPE_MILD_CVE,
    ALERT_TYPE_SOCKET_UPGRADE_AVAILABLE,
    API_V0_URL,
    // Lazily defined values are initialized as `undefined` to keep their key order.
    BATCH_PURL_ENDPOINT: undefined,
    BINARY_LOCK_EXT,
    BUN,
    CLI,
    CVE_ALERT_PROPS_FIRST_PATCHED_VERSION_IDENTIFIER,
    CVE_ALERT_PROPS_VULNERABLE_VERSION_RANGE,
    DIST_TYPE: undefined,
    DRY_RUN_LABEL,
    DRY_RUN_BAIL_TEXT,
    ENV: undefined,
    LOCK_EXT,
    MODULE_SYNC,
    NPM_REGISTRY_URL,
    PNPM,
    REDACTED,
    REQUIRE,
    SHADOW_NPM_BIN,
    SHADOW_NPM_INJECT,
    SHADOW_NPM_PATHS,
    SOCKET,
    SOCKET_CLI_BIN_NAME,
    SOCKET_CLI_BIN_NAME_ALIAS,
    SOCKET_CLI_DEBUG,
    SOCKET_CLI_FIX,
    SOCKET_CLI_ISSUES_URL,
    SOCKET_CLI_SENTRY_BIN_NAME_ALIAS,
    SOCKET_CLI_LEGACY_BUILD,
    SOCKET_CLI_LEGACY_PACKAGE_NAME,
    SOCKET_CLI_NO_API_TOKEN,
    SOCKET_CLI_OPTIMIZE,
    SOCKET_CLI_PACKAGE_NAME,
    SOCKET_CLI_PUBLISHED_BUILD,
    SOCKET_CLI_SAFE_WRAPPER,
    SOCKET_CLI_SENTRY_BIN_NAME,
    SOCKET_CLI_SENTRY_BUILD,
    SOCKET_CLI_SENTRY_NPM_BIN_NAME,
    SOCKET_CLI_SENTRY_NPX_BIN_NAME,
    SOCKET_CLI_SENTRY_PACKAGE_NAME,
    SOCKET_CLI_VERSION_HASH,
    VLT,
    WITH_SENTRY,
    YARN,
    YARN_BERRY,
    YARN_CLASSIC,
    bashRcPath: undefined,
    distCliPath: undefined,
    distInstrumentWithSentryPath: undefined,
    distPath: undefined,
    distShadowNpmBinPath: undefined,
    distShadowNpmInjectPath: undefined,
    homePath: undefined,
    nmBinPath: undefined,
    rootBinPath: undefined,
    rootDistPath: undefined,
    rootPath: undefined,
    rootPkgJsonPath: undefined,
    shadowBinPath: undefined,
    zshRcPath: undefined
  },
  {
    getters: {
      BATCH_PURL_ENDPOINT: LAZY_BATCH_PURL_ENDPOINT,
      DIST_TYPE: LAZY_DIST_TYPE,
      ENV: LAZY_ENV,
      bashRcPath: lazyBashRcPath,
      distCliPath: lazyDistCliPath,
      distInstrumentWithSentryPath: lazyDistInstrumentWithSentryPath,
      distPath: lazyDistPath,
      distShadowNpmBinPath: lazyDistShadowNpmBinPath,
      distShadowNpmInjectPath: lazyDistShadowNpmInjectPath,
      homePath: lazyHomePath,
      nmBinPath: lazyNmBinPath,
      rootBinPath: lazyRootBinPath,
      rootDistPath: lazyRootDistPath,
      rootPath: lazyRootPath,
      rootPkgJsonPath: lazyRootPkgJsonPath,
      shadowBinPath: lazyShadowBinPath,
      zshRcPath: lazyZshRcPath
    },
    internals: {
      getSentry() {
        return _Sentry
      },
      setSentry(Sentry: Sentry): boolean {
        if (_Sentry === undefined) {
          _Sentry = Sentry
          return true
        }
        return false
      }
    },
    mixin: registryConstants
  }
)

export default constants
