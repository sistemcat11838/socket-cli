import process from 'node:process'

import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'

import isInteractive from '@socketregistry/is-interactive/index.cjs'
import { SOCKET_PUBLIC_API_TOKEN } from '@socketsecurity/registry/lib/constants'
import { password } from '@socketsecurity/registry/lib/prompts'
import { isNonEmptyString } from '@socketsecurity/registry/lib/strings'
import { SocketSdk, createUserAgentFromPkgJson } from '@socketsecurity/sdk'

import { AuthError } from './errors'
import { getSetting } from './settings'
import constants from '../constants'

const { SOCKET_CLI_NO_API_TOKEN } = constants

// The API server that should be used for operations.
function getDefaultApiBaseUrl(): string | undefined {
  const baseUrl =
    process.env['SOCKET_SECURITY_API_BASE_URL'] || getSetting('apiBaseUrl')
  return isNonEmptyString(baseUrl) ? baseUrl : undefined
}

// The API server that should be used for operations.
function getDefaultHttpProxy(): string | undefined {
  const apiProxy =
    process.env['SOCKET_SECURITY_API_PROXY'] || getSetting('apiProxy')
  return isNonEmptyString(apiProxy) ? apiProxy : undefined
}

// This API key should be stored globally for the duration of the CLI execution.
let _defaultToken: string | undefined
export function getDefaultToken(): string | undefined {
  // Lazily access constants.ENV[SOCKET_CLI_NO_API_TOKEN].
  if (constants.ENV[SOCKET_CLI_NO_API_TOKEN]) {
    _defaultToken = undefined
  } else {
    const key =
      process.env['SOCKET_SECURITY_API_TOKEN'] ||
      // Keep 'SOCKET_SECURITY_API_KEY' as an alias of 'SOCKET_SECURITY_API_TOKEN'.
      // TODO: Remove 'SOCKET_SECURITY_API_KEY' alias.
      process.env['SOCKET_SECURITY_API_KEY'] ||
      getSetting('apiToken') ||
      _defaultToken
    _defaultToken = isNonEmptyString(key) ? key : undefined
  }
  return _defaultToken
}

export function getPublicToken(): string {
  return getDefaultToken() ?? SOCKET_PUBLIC_API_TOKEN
}

export async function setupSdk(
  apiToken: string | undefined = getDefaultToken(),
  apiBaseUrl: string | undefined = getDefaultApiBaseUrl(),
  proxy: string | undefined = getDefaultHttpProxy()
): Promise<SocketSdk> {
  if (typeof apiToken !== 'string' && isInteractive()) {
    apiToken = await password({
      message:
        'Enter your Socket.dev API key (not saved, use socket login to persist)'
    })
    _defaultToken = apiToken
  }
  if (!apiToken) {
    throw new AuthError('You need to provide an API key')
  }
  return new SocketSdk(apiToken, {
    agent: proxy
      ? {
          http: new HttpProxyAgent({ proxy }),
          https: new HttpsProxyAgent({ proxy })
        }
      : undefined,
    baseUrl: apiBaseUrl,
    // Lazily access constants.rootPkgJsonPath.
    userAgent: createUserAgentFromPkgJson(require(constants.rootPkgJsonPath))
  })
}
