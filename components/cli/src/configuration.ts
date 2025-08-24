import { ConfigurationItem, Host, Logger } from '@ssh-keyring/core'
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
  '~/.config/ssh-keyring/remotes',
  '~/.keyring/remotes',
]

type LoadConfiguration = (
  logger: Logger,
  configPath?: string,
) => Promise<ConfigurationItem>

export const loadConfiguration: LoadConfiguration = async (
  logger,
  configPath,
) => {
  const pathSearchLocations =
    configPath !== undefined
      ? [configPath, ...DefaultConfigurationLocations]
      : DefaultConfigurationLocations

  logger.debug('looking for configuration in:')
  pathSearchLocations.forEach((l) => logger.debug(`  - ${l}`))

  for (const path of pathSearchLocations) {
    try {
      const fileContents = await readFile(path)
      // TODO throw toml parsing error ?
      return parse(fileContents.toString())
    } catch (e) {
      logger.debug(`configuration at '${path}' could not be read`)
      logger.debug(String(e))
    }
  }

  throw new NoRemoteConfigurationFoundError('no remote configuration found')
}

type GetPluginRemotes = (
  logger: Logger,
  pluginName: string,
  configuration: ConfigurationItem,
) => ConfigurationItem

export const getPluginRemotes: GetPluginRemotes = (
  logger,
  pluginName,
  configuration,
) => {
  if (!(pluginName in configuration)) {
    logger.debug(
      `no remotes configured for '${pluginName}': no '${pluginName}' objects in config`,
    )

    return {}
  }

  if (configuration[pluginName] === null) {
    logger.debug(
      `no remotes configured for '${pluginName}': '${pluginName}' object is null`,
    )

    return {}
  }

  if (typeof configuration[pluginName] !== 'object') {
    logger.debug(
      `no remotes configured for '${pluginName}': '${pluginName}' is not an object`,
    )

    return {}
  }

  return configuration[pluginName] as ConfigurationItem
}

type GenerateSshConfiguration = (remotes: Record<string, Host>) => string

export const generateSshConfiguration: GenerateSshConfiguration = (remotes) => {
  const hosts = Object.keys(remotes).map((remoteName) => {
    const configuredOptions = Object.keys(remotes[remoteName]) as (keyof Host)[]
    const hostConfigurationString = configuredOptions.map((key) => `  ${key} ${remotes[remoteName][key]}`).join('\n')

    return `Host ${remoteName}\n${hostConfigurationString}`
  })

  return hosts.join('\n\n')
}
