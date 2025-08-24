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
import { mkdir, writeFile } from 'fs/promises'
import { generateSshConfiguration } from './configuration'

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
  outDir: string,
) => Promise<boolean>

export const runPlugin: RunPlugin = async (plugin, configuration, logger, outDir) => {
  logger.debug(`loading '${plugin.name}' remotes`)
  const remotes = loadPluginRemotes(configuration, plugin)

  if (Object.keys(remotes).length === 0) {
    logger.log(`no remotes configured for '${plugin.name}'`)

    return true
  }

  logger.debug(`'${plugin.name}' remotes found:`)
  logger.debug(JSON.stringify(remotes, null, 2))

  logger.debug('finding remotes that comply with base schema')

  const validBaseRemoteEntries = Object.entries(remotes).filter(
    ([remoteName, remote]) => {
      try {
        baseRemoteSchema.validate(remote)
        logger.debug(`  - ${remoteName} is valid`)
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

  logger.debug('validated remotes:')
  logger.debug(JSON.stringify(Object.fromEntries(validBaseRemoteEntries), null, 2))

  const configurations: Record<string, Host> = {}

  for (const [remoteName, remote] of validBaseRemoteEntries) {
    logger.debug(`generating key for '${remoteName}'`)
    const baseRemote = await baseRemoteSchema.validate(remote)
    const { privateKey, publicKey } = await generateSshKey(baseRemote)
    console.log(publicKey)

    logger.debug(`calling '${plugin.name}' plugin to configure remote`)
    configurations[remoteName] = await plugin.configureRemote(remoteName, remote, publicKey, logger)

    logger.debug(`saving key configuraiton for '${plugin.name}'`)
    await mkdir(`${outDir}/keys/${remoteName}`, { recursive: true })
    await writeFile(`${outDir}/keys/${remoteName}/id_ed25519.pem`, privateKey)
    await writeFile(`${outDir}/keys/${remoteName}/id_ed25519.pem.pub`, publicKey)

    configurations[remoteName].IdentityFile = `${outDir}/keys/${remoteName}/id_ed25519.pem`
  }

  logger.debug(`writing ssh config for '${plugin.name}' remotes`)
  await writeFile(`${outDir}/config`, generateSshConfiguration(configurations))

  logger.log('ssh configuration created')
  logger.log('add the following line to your ~/.ssh/config to access your remotes:')
  logger.log(`    Include ${outDir}/config`)

  return true
}
