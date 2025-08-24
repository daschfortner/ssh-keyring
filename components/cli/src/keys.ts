import { generateKeyPairSync } from 'node:crypto'
import { BaseRemote } from '@ssh-keyring/core'

export const generateSshKey = async (config: BaseRemote) => {
  return generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      ...(config.passphrase !== undefined ? { passphrase: config.passphrase } : {})
    },
  })
}
