import { Plugin } from '@ssh-keyring/core'
import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(callbackExec)

export const loadPlugins: () => Promise<Plugin[]> = async () => {
  const { stdout } = await exec('npm list -g --json')

  const globalPackages = JSON.parse(stdout)
  
  const keyringPlugins = Object.keys(globalPackages.dependencies).filter((d) => d.startsWith('@ssh-keyring/plugin-'))

  const plugins = await Promise.all(keyringPlugins.map(async (plugin) => await import(plugin)))

  return plugins.map((p) => p.default.default)
}

