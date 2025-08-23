import type { Plugin } from '@ssh-keyring/core'
import { InvalidPluginRemoteError, PluginError } from '@ssh-keyring/core'
import { githubRemoteSchema } from './schema'

const plugin: Plugin = {
  name: 'github',
  description: 'Manage ssh keys on github',
  configureRemote: async (name, remote, publicKey, logger) => {
    try {
      githubRemoteSchema.validateSync(remote)
    } catch (e) {
      throw new InvalidPluginRemoteError(
        `could not configure ${plugin.name} remote '${name}': ${e}`,
      )
    }

    const githubRemote = await githubRemoteSchema.validate(remote)

    try {
      await fetch('https://api.github.com/user/keys', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubRemote.accessToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          title: githubRemote.keyTitle,
          key: publicKey,
        }),
      })
    } catch (e) {
      logger.debug('failed to upload key to github account:')
      logger.debug(String(e))

      throw new PluginError('could not configure github plugin')
    }

    return {
      HostName: 'github.com',
    }
  },
}

export default plugin
