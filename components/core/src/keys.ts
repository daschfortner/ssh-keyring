import { generateKeyPairSync } from 'node:crypto'
import { BaseRemote } from './schema'
import { DefaultAlgorithm, DefaultPrivateKeyConfig, DefaultPublicKeyConfig } from './defaults'

export const generateSshKey = async (config: BaseRemote) => {
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
