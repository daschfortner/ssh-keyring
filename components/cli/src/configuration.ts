import { ConfigurationItem, Logger } from '@ssh-keyring/core'
import { readFile } from 'fs/promises'
import { parse } from 'toml'

export class NoRemoteConfigurationFoundError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class NoPluginRemotesError extends Error {
  constructor(message: string) {
    super(message)
  }
}

const DefaultConfigurationLocations: string[] = [
  '~/.config/ssh-keyring/keyringrc',
  '~/.keyringrc',
]

type LoadConfiguration = (logger: Logger, configPath?: string) => Promise<ConfigurationItem>

export const loadConfiguration: LoadConfiguration = async (logger, configPath) => {
  const pathSearchLocations = configPath !== undefined ? [
    configPath,
    ...DefaultConfigurationLocations,
  ] : DefaultConfigurationLocations

  logger.info('looking for configuration in:')
  pathSearchLocations.forEach((l) => logger.info(`  - ${l}`))

  for (const path in pathSearchLocations) {
    try {
      const fileContents = await readFile(path)
      return parse(fileContents.toString())
    } catch(e) {
      logger.debug(`configuration at '${path}' could not be read`)
    }
  }

  throw new NoRemoteConfigurationFoundError('no remote configuration found')
}

type GetPluginRemotes = (logger: Logger, pluginName: string, configuration: ConfigurationItem) => ConfigurationItem

export const getPluginRemotes: GetPluginRemotes = (logger, pluginName, configuration) => {
  if (!(pluginName in configuration)) {
    logger.debug(`no remotes configured for '${pluginName}': no '${pluginName}' objects in config`)
    throw new NoPluginRemotesError(`no remotes configured for '${pluginName}'`)
  }

  if (configuration[pluginName] === null) {
    logger.debug(`no remotes configured for '${pluginName}': '${pluginName}' object is null`)
    throw new NoPluginRemotesError(`no remotes configured for '${pluginName}'`)
  }

  if (typeof configuration[pluginName] !== 'object') {
    logger.debug(`no remotes configured for '${pluginName}': '${pluginName}' is not an object`)
    throw new NoPluginRemotesError(`no remotes configured for '${pluginName}'`)
  }

  return configuration[pluginName]
}
