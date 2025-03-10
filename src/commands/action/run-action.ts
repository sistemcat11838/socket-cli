// https://github.com/SocketDev/socket-python-cli/blob/6d4fc56faee68d3a4764f1f80f84710635bdaf05/socketsecurity/socketcli.py

import micromatch from 'micromatch'
import { simpleGit } from 'simple-git'

import { logger } from '@socketsecurity/registry/lib/logger'
import { SocketSdk } from '@socketsecurity/sdk'

import { Core } from './core'
import { GitHub } from './core/github'
import * as Messages from './core/messages'
import * as SCMComments from './core/scm_comments'
import { getDefaultToken } from '../../utils/sdk'

// TODO: is this a github action handler?
export async function runAction(
  githubEventBefore: string,
  githubEventAfter: string
) {
  //TODO
  const socket = new SocketSdk(getDefaultToken()!)

  const git = simpleGit()
  const changedFiles = (
    await git.diff(
      process.env['GITHUB_EVENT_NAME'] === 'pull_request'
        ? ['--name-only', 'HEAD^1', 'HEAD']
        : ['--name-only', githubEventBefore, githubEventAfter]
    )
  ).split('\n')

  logger.log({ changedFiles })
  // supportedFiles have 3-level deep globs
  const patterns = Object.values(await socket.getReportSupportedFiles())
    .flatMap((i: Record<string, any>) => Object.values(i))
    .flatMap((i: Record<string, any>) => Object.values(i))
    .flatMap((i: Record<string, any>) => Object.values(i))

  const files = micromatch(changedFiles, patterns)

  const scm = new GitHub()

  if (scm.checkEventType() === 'comment') {
    logger.log('Comment initiated flow')
    const comments = await scm.getCommentsForPR()
    await scm.removeCommentAlerts({ comments })
  } else if (scm.checkEventType() === 'diff') {
    logger.log('Push initiated flow')
    const core = new Core({ owner: scm.owner, repo: scm.repo, files, socket })
    const diff = await core.createNewDiff({})
    const comments = await scm.getCommentsForPR()
    diff.newAlerts = SCMComments.removeAlerts({
      comments,
      newAlerts: diff.newAlerts
    })
    const overviewComment = Messages.dependencyOverviewTemplate(diff)
    const securityComment = Messages.securityCommentTemplate(diff)
    let newSecurityComment = true
    let newOverviewComment = true
    let updateOldSecurityComment = comments.security !== undefined
    let updateOldOverviewComment = comments.overview !== undefined
    if (diff.newAlerts.length === 0) {
      if (!updateOldSecurityComment) {
        newSecurityComment = false
        logger.log('No new alerts or security issue comment disabled')
      } else {
        logger.log('Updated security comment with no new alerts')
      }
    }
    if (diff.newPackages.length === 0 && diff.removedPackages.length === 0) {
      if (!updateOldOverviewComment) {
        newOverviewComment = false
        logger.log(
          'No new/removed packages or Dependency Overview comment disabled'
        )
      } else {
        logger.log('Updated overview comment with no dependencies')
      }
    }
    await scm.addSocketComments({
      securityComment,
      overviewComment,
      comments,
      newSecurityComment,
      newOverviewComment
    })
  }
}
