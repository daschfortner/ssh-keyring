import { ConfigurationItem } from '@ssh-keyring/core'
import { readFile } from 'fs/promises'
import { parse } from 'toml'


const DefaultConfigurationLocations: string[] = [
  '~/.config/ssh-keyring/keyringrc',
  '~/.keyringrc',
]

const loadConfiguration: (configPath: string) => Promise<ConfigurationItem> = async (configPath?: string) => {
  const pathSearchLocations = configPath !== undefined ? [
    configPath,
    ...DefaultConfigurationLocations,
  ] : DefaultConfigurationLocations

  for (const path in pathSearchLocations) {
    try {
      const fileContents = await readFile(path)
      return parse(fileContents.toString())
    } catch(e) {
      
    }
  }
}
