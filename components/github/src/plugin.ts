import type { Plugin, ConfigurationItem } from '@ssh-keyring/core'
import { InvalidPluginRemoteError } from '@ssh-keyring/core'
import { githubRemoteSchema } from './schema'

const configureRemote = async (name: string, remote: ConfigurationItem, publicKey: string) => {
  try {
    githubRemoteSchema.validateSync(remote)
  } catch(e) {
    throw new InvalidPluginRemoteError(`could not configure ${plugin.name} remote '${name}': ${e}`)
  }

  const githubRemote = await githubRemoteSchema.validate(remote)

  await fetch('https://api.github.com/user/keys', {
    headers: {
      'Authorization': `Bearer ${githubRemote.accessToken}`,
    },
    body: JSON.stringify({
      title: githubRemote.keyTitle,
      key: publicKey,
    })
  })

  return {}
}

const plugin: Plugin = {
  name: 'github',
  description: 'Manage ssh keys on github',
  configureRemote,
}

export default plugin
