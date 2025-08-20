import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import type { OptionDefinition } from 'command-line-usage'
import { createLogger, LogLevels, type Plugin } from '@ssh-keyring/core'
import { loadPlugins } from './loadPlugins'


const CliOptions: OptionDefinition[] = [
  {
    name: 'log-level',
    description: 'Logging level to use (debug, info, or error)',
    alias: 'l',
    defaultValue: 'error',
    type: String,
  },
  {
    name: 'remotes-path',
    description: 'Override the default configuration paths and use a costom remote configuration path',
    alias: 'r',
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
      ]
    },
    {
      header: 'AVAILABLE PLUGINS',
      content: plugins.length ? plugins.map((p) => ({
        header: p.name,
        content: p.description,
      })) : [
        'No plugins available.',
        'Install a plugin to run the keyring.',
      ]
    },
  ])
}

export const main = async () => {
  const availablePlugins = await loadPlugins()

  const { pluginCommand, logLevel, _unknown } = commandLineArgs([{ name: 'pluginCommand', defaultOption: true }, ...CliOptions], { stopAtFirstUnknown: true, camelCase: true })

  const logger = createLogger(LogLevels.includes(logLevel) ? logLevel : 'error')

  if (pluginCommand === undefined) {
    // using normal log so user can't accidentally turn off usage text
    console.log(printUsage(availablePlugins))
    process.exit(0)
  }

  const selectedPlugin = availablePlugins.find((plugin) => plugin.name === pluginCommand)

  if (selectedPlugin === undefined) {
    logger.error(`plugin '${pluginCommand}' is not installed`)
    logger.error('see <insert url> for instructions to install plugins')
    // using normal log so user can't accidentally turn off usage text
    console.log(printUsage(availablePlugins))
    process.exit(1)
  }
}
