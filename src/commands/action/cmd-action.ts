// https://github.com/SocketDev/socket-python-cli/blob/6d4fc56faee68d3a4764f1f80f84710635bdaf05/socketsecurity/socketcli.py
import meowOrExit from 'meow'

import { runAction } from './run-action.ts'
import { type CliCommandConfig } from '../../utils/meow-with-subcommands'
import { getFlagListOutput } from '../../utils/output-formatting.ts'

const config: CliCommandConfig = {
  commandName: 'action',
  description: 'Socket action command', // GitHub Action ?
  hidden: true,
  flags: {
    // This flag is unused
    // socketSecurityApiKey: { // deprecate this asap.
    //   type: 'string',
    //   default: 'env var SOCKET_SECURITY_API_KEY',
    //   description: 'Socket API token'
    // },
    githubEventBefore: {
      type: 'string',
      default: '',
      description: 'Before marker'
    },
    githubEventAfter: {
      type: 'string',
      default: '',
      description: 'After marker'
    }
  },
  help: (parentName, { commandName, flags }) => `
    Usage
      $ ${parentName} ${commandName} [options]

    Options
      ${getFlagListOutput(flags, 6)}
  `
}

export const cmdAction = {
  description: config.description,
  hidden: config.hidden,
  run: run
}

async function run(
  argv: readonly string[],
  importMeta: ImportMeta,
  { parentName }: { parentName: string }
): Promise<void> {
  const cli = meowOrExit(config.help(parentName, config), {
    argv,
    description: config.description,
    importMeta,
    flags: config.flags
  })

  const githubEventBefore = String(cli.flags['githubEventBefore'] || '')
  const githubEventAfter = String(cli.flags['githubEventAfter'] || '')

  await runAction(githubEventBefore, githubEventAfter)
}
