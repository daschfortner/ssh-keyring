import {
  baseRemoteSchema,
  ConfigurationItem,
  Host,
  loadPluginRemotes,
  Logger,
  Plugin,
} from '@ssh-keyring/core'
import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'
import { generateSshKey } from './keys'
import SSHConfig from 'ssh-config'

const exec = promisify(callbackExec)

export const loadPlugins: () => Promise<Plugin[]> = async () => {
  const { stdout } = await exec('npm list -g --json')

  const globalPackages = JSON.parse(stdout)

  const keyringPlugins = Object.keys(globalPackages.dependencies).filter((d) =>
    d.startsWith('@ssh-keyring/plugin-'),
  )

  const plugins = await Promise.all(
    keyringPlugins.map(async (plugin) => await import(plugin)),
  )

  return plugins.map((p) => p.default.default)
}

type RunPlugin = (
  plugin: Plugin,
  configuration: ConfigurationItem,
  logger: Logger,
) => Promise<boolean>

export const runPlugin: RunPlugin = async (plugin, configuration, logger) => {
  const remotes = loadPluginRemotes(configuration, plugin)

  if (Object.keys(remotes).length === 0) {
    logger.log(`no remotes configured for '${plugin.name}'`)

    return true
  }

  const validBaseRemoteEntries = Object.entries(remotes).filter(
    ([remoteName, remote]) => {
      try {
        baseRemoteSchema.validate(remote)
      } catch (e) {
        logger.info(`remote schema for '${remoteName}' invalid`)
        logger.info(`could not parse base schema configuration: ${e}`)
        logger.error(
          `could not process '${remoteName}' due to invalid remote configuraiton`,
        )

        return false
      }

      return true
    },
  ) as [string, ConfigurationItem][]

  const configurations: Record<string, Host> = {}

  for (const [remoteName, remote] of validBaseRemoteEntries) {
    const baseRemote = await baseRemoteSchema.validate(remote)
    const { privateKey, publicKey } = await generateSshKey(baseRemote)

    const remoteConfiguration = plugin.configureRemote(remoteName, remote, publicKey)
    
    // write out keys and configure ssh config object
  }

  return true
}
