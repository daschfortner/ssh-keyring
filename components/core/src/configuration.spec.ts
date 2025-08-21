import { Plugin } from './schema'
import { loadPluginRemotes, NoPluginRemotesError } from './configuration'
import { object } from 'yup'

describe('loadPluginRemotes', () => {
  it('throws an error if there is no remotes for the plugin', () => {
    const plugin: Plugin = {
      name: 'github',
      description: 'github plugin',
      configureRemote: jest.fn(),
    }

    const configuration = {}

    expect(() => loadPluginRemotes(configuration, plugin)).toThrow(
      NoPluginRemotesError,
    )
  })

  it('collects the remotes based on plugin name', () => {
    const plugin: Plugin = {
      name: 'gitlab',
      description: 'gitlab plugin',
      configureRemote: jest.fn(),
    }

    const configuration = {
      gitlab: {
        personal: {
          personalAccessToken: 'glpat-something-secret',
        },
        work: {
          personalAccessToken: 'glpat-something-else',
        },
      },
    }

    expect(loadPluginRemotes(configuration, plugin)).toMatchObject(
      configuration.gitlab,
    )
  })
})
