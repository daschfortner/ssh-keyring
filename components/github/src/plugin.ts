import type { Plugin, ConfigurationItem } from '@ssh-keyring/core'
import { InvalidPluginRemoteError } from '@ssh-keyring/core'
import { ValidationError } from 'yup'
import { githubRemoteSchema } from './schema'

const printUsage = () => {
  
}

const configureRemote = async (name: string, remote: ConfigurationItem, args: string[]) => {
  try {
    githubRemoteSchema.validateSync(remote)
  } catch(e) {
    throw new InvalidPluginRemoteError(`could not configure ${plugin.name} remote '${name}': ${e}`)
  }

  const githubRemote = await githubRemoteSchema.validate(remote)


  return ''
}

const plugin: Plugin = {
  name: 'github',
  description: 'Manage ssh keys on github',
  configureRemote,
}

export default plugin
