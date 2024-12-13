import path from 'node:path'

import spawn from '@npmcli/promise-spawn'

import constant from '../constants'

import type { CliSubcommand } from '../utils/meow-with-subcommands'

const { distPath } = constant

const description = 'npm wrapper functionality'

export const npm: CliSubcommand = {
  description,
  async run(argv, _importMeta, _ctx) {
    const wrapperPath = path.join(distPath, 'npm-cli.js')
    process.exitCode = 1
    const spawnPromise = spawn(
      process.execPath,
      ['--disable-warning', 'ExperimentalWarning', wrapperPath, ...argv],
      { stdio: 'inherit' }
    )
    spawnPromise.process.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal)
      } else if (code !== null) {
        process.exit(code)
      }
    })
    await spawnPromise
  }
}
