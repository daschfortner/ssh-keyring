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

    const githubHost = githubRemote.api_host ?? 'api.github.com'

    try {
      await fetch(`https://${githubHost}/user/keys`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubRemote.access_token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          ...(githubRemote.key_title !== undefined ? { title: githubRemote.key_title } : {}),
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
