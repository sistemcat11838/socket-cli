// @ts-ignore
import chalkTable from 'chalk-table'
import colors from 'yoctocolors-cjs'

import { logger } from '@socketsecurity/registry/lib/logger'

import constants from '../../constants'
import { handleApiCall, handleUnsuccessfulApiResponse } from '../../utils/api'
import { AuthError } from '../../utils/errors'
import { getDefaultToken, setupSdk } from '../../utils/sdk'

export async function findDependencies({
  limit,
  offset,
  outputJson
}: {
  outputJson: boolean
  limit: number
  offset: number
}): Promise<void> {
  const apiToken = getDefaultToken()
  if (!apiToken) {
    throw new AuthError(
      'User must be authenticated to run this command. To log in, run the command `socket login` and enter your API key.'
    )
  }
  // Lazily access constants.spinner.
  const { spinner } = constants

  spinner.start('Searching dependencies...')

  const socketSdk = await setupSdk(apiToken)

  const result = await handleApiCall(
    socketSdk.searchDependencies({ limit, offset }),
    'Searching dependencies'
  )

  if (!result.success) {
    handleUnsuccessfulApiResponse('searchDependencies', result)
    return
  }

  spinner.stop('Organization dependencies:')

  if (outputJson) {
    logger.log(result.data)
    return
  }

  logger.log(
    'Request details: Offset:',
    offset,
    ', limit:',
    limit,
    ', is there more data after this?',
    result.data.end ? 'no' : 'yes'
  )

  const options = {
    columns: [
      { field: 'namespace', name: colors.cyan('Namespace') },
      { field: 'name', name: colors.cyan('Name') },
      { field: 'version', name: colors.cyan('Version') },
      { field: 'repository', name: colors.cyan('Repository') },
      { field: 'branch', name: colors.cyan('Branch') },
      { field: 'type', name: colors.cyan('Type') },
      { field: 'direct', name: colors.cyan('Direct') }
    ]
  }

  logger.log(chalkTable(options, result.data.rows))
}
