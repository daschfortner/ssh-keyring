import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import type { OptionDefinition } from 'command-line-args'
import type { Plugin } from '@ssh-keyring/types'

const exec = promisify(callbackExec)

const loadPlugins: () => Promise<Plugin[]> = async () => {
  const { stdout } = await exec('npm list -g --json')

  const globalPackages = JSON.parse(stdout)

  console.log(globalPackages)
  
  const keyringPlugins = Object.keys(globalPackages.dependencies).filter((d) => d.startsWith('@ssh-keyring/plugin-'))

  const plugins = await Promise.all(keyringPlugins.map(async (plugin) => await import(plugin)))

  return plugins.map((p) => p.default.default)
}

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

  const cliOptions: OptionDefinition[] = [
    {
      name: 'pluginCommand',
      defaultOption: true,
      type: String,
    }
  ]

  const { pluginCommand, _unknown } = commandLineArgs(cliOptions, { stopAtFirstUnknown: true })

  if (pluginCommand === undefined) {
    console.log(printUsage(availablePlugins))
    process.exit(0)
  }

  const selectedPlugin = availablePlugins.find((plugin) => plugin.name === pluginCommand)

  if (selectedPlugin === undefined) {
    console.error(`plugin '${pluginCommand}' is not installed`)
    console.error('see <insert url> for instructions to install plugins')
    console.log(printUsage(availablePlugins))
    process.exit(1)
  }

  await selectedPlugin.run(_unknown ?? [])
}
