import type {Plugin} from '@ssh-keyring/types'

const printUsage = () => {

}

const run = async (args: string[]) => {
  
}

const plugin: Plugin = {
  name: 'github',
  description: 'Manage ssh keys on github',
  run,
}

export default plugin
