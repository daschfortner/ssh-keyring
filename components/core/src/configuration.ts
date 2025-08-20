import { ConfigurationItem, Plugin } from "./schema";

// TODO: move to an errors.ts file
export class NoPluginRemotesError extends Error {
  constructor(error: string) {
    super(error)
  }
}

export class InvalidPluginRemoteError extends Error {
  constructor(error: string) {
    super(error)
  }
}

type LoadPluginRemotesFunction = (configuration: ConfigurationItem, plugin: Plugin) => ConfigurationItem

export const loadPluginRemotes: LoadPluginRemotesFunction = (configuration, plugin) => {
  const { name } = plugin

  if (!(name in configuration)) {
    throw new NoPluginRemotesError(`no configuration for plugin '${name}' found`)
  }

  const remotes = configuration[name]

  if (typeof remotes !== 'object' || remotes === null) {
    throw new InvalidPluginRemoteError(`no remotes configured for '${name}'`)
  }

  // TODO: Look into this more
  return remotes as ConfigurationItem
}
