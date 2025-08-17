import { generateKeyPairSync } from 'node:crypto'
import { KeyConfig } from '@ssh-keyring/types'
import { DefaultAlgorithm, DefaultPrivateKeyConfig, DefaultPublicKeyConfig } from './defaults'

export const generateSshKey = async (config: KeyConfig) => {
  return generateKeyPairSync(DefaultAlgorithm, {
    publicKeyEncoding: {
      ...DefaultPublicKeyConfig,
      ...config.publicKey,
    },
    privateKeyEncoding: {
      ...DefaultPrivateKeyConfig,
      ...config.privateKey,
    },
  })
}
