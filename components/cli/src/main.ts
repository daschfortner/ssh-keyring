import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import type { OptionDefinition } from 'command-line-usage'
import { createLogger, LogLevels, type Plugin } from '@ssh-keyring/core'
import { loadPlugins, runPlugin } from './plugins'
import { DefaultOutputDirectory, loadConfiguration, NoRemoteConfigurationFoundError } from './configuration'
import { mkdir, readdir, rmdir } from 'node:fs/promises'

const CliOptions: OptionDefinition[] = [
  {
    name: 'remotes-path',
    description:
      'Override the default configuration paths and use a costom remote configuration path',
    alias: 'r',
    type: String,
  },
  {
    name: 'output-directory',
    description: 'Specify the output directory in which to save the keys and configuration file',
    alias: 'o',
    type: String,
  },
  {
    name: 'force',
    description: 'Force removal of output-directory if it exists',
    alias: 'f',
    type: Boolean,
  },
  {
    name: 'log-level',
    description: 'Logging level to use (debug, info, or error)',
    alias: 'l',
    defaultValue: 'error',
    type: String,
  }
]

const printUsage = (plugins: Plugin[]) => {
  return commandLineUsage([
    {
      header: 'ssh-keyring',
      content: 'Manage ssh keys on remote environments.',
    },
    {
      header: 'USAGE',
      content: 'ssh-keyring <plugin> [args]',
    },
    {
      header: 'ARGUMENTS',
      optionList: CliOptions,
    },
    {
      header: 'INSTALLING PLUGINS',
      content: [
        'To run the keyring on a remote, you need to install a plugin.',
        'For instructions on how to install a plugin, see <insert link>.',
      ],
    },
    {
      header: 'AVAILABLE PLUGINS',
      content: plugins.length
        ? plugins.map((p) => ({
            header: p.name,
            content: p.description,
          }))
        : ['No plugins available.', 'Install a plugin to run the keyring.'],
    },
  ])
}

export const main = async () => {
  const availablePlugins = await loadPlugins()

  const { pluginCommand, remotesPath, logLevel, outputDirectory, force, _unknown } = commandLineArgs(
    [{ name: 'pluginCommand', defaultOption: true }, ...CliOptions],
    { stopAtFirstUnknown: true, camelCase: true },
  )

  const logger = createLogger(LogLevels.includes(logLevel) ? logLevel : 'error')

  if (pluginCommand === undefined) {
    // using normal log so user can't accidentally turn off usage text
    console.log(printUsage(availablePlugins))
    process.exit(0)
  }

  const selectedPlugin = availablePlugins.find(
    (plugin) => plugin.name === pluginCommand,
  )

  if (selectedPlugin === undefined) {
    logger.error(`plugin '${pluginCommand}' is not installed`)
    logger.error('see <insert url> for instructions to install plugins')
    // using normal log so user can't accidentally turn off usage text
    console.log(printUsage(availablePlugins))
    process.exit(1)
  }

  const outDir = outputDirectory ?? DefaultOutputDirectory

  try {
    const files = await readdir(outDir)

    if (files.length !== 0) {
      if (force) {
        logger.log(`contents of '${outDir}' will be overwritten`)
        logger.debug(`cleaning up existing directory '${outDir}'`)
        await rmdir(outDir, { recursive: true })
      } else {
        logger.error(`'${outDir}' exists and is not empty`)
        logger.error(`remote '${outDir}' or use the --force flag to remove`)
        process.exit(1)
      }
    } 
  } catch(e) {
    logger.debug(`'${outDir}' does not exist, will be created`)
  }

  try {
    logger.debug(`remaking output directory '${outDir}'`)
    await mkdir(outDir, { recursive: true })
  } catch(e) {
    logger.error(`could not create output directory '${outDir}'`)
    logger.error(`make sure you have permissions to create '${outDir}'`)
    process.exit(1)
  }

  try {
    logger.debug(`loading remote configuraiton from '${remotesPath}'`)
    const configuration = await loadConfiguration(logger, remotesPath)

    logger.debug('loaded remote configuration:')
    logger.debug(JSON.stringify(configuration, null, 2))

    logger.debug(`running plugin '${selectedPlugin.name}'`)
    const success = await runPlugin(selectedPlugin, configuration, logger, outputDirectory)

    if (!success) {
      logger.error(`remote configuration failed for '${selectedPlugin.name}'`)
      process.exit(1)
    }
  } catch(e) {
    if (e instanceof NoRemoteConfigurationFoundError) {
      logger.error('could not load any remotes file')
      logger.error('specify a remotes configuraiton with --remotes-path, or place in a default path')
      process.exit(1)
    }
  }
}
