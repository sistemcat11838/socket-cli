import { logger } from '@socketsecurity/registry/lib/logger'

import { runRawNpm } from './run-raw-npm'
import constants from '../../constants'
import { meowOrExit } from '../../utils/meow-with-subcommands'

import type { CliCommandConfig } from '../../utils/meow-with-subcommands'

const { DRY_RUN_BAIL_TEXT, NPM } = constants

const config: CliCommandConfig = {
  commandName: 'raw-npm',
  description: `Temporarily disable the Socket ${NPM} wrapper`,
  hidden: false,
  flags: {},
  help: command => `
    Usage
      $ ${command} <command>

    Examples
      $ ${command} install
  `
}

export const cmdRawNpm = {
  description: config.description,
  hidden: config.hidden,
  run
}

async function run(
  argv: readonly string[],
  importMeta: ImportMeta,
  { parentName }: { parentName: string }
): Promise<void> {
  const cli = meowOrExit({
    allowUnknownFlags: true,
    argv,
    config,
    importMeta,
    parentName
  })

  if (cli.flags['dryRun']) {
    logger.log(DRY_RUN_BAIL_TEXT)
    return
  }

  await runRawNpm(argv)
}
