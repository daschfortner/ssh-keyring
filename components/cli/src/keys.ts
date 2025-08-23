import { generateKeyPairSync } from 'node:crypto'
import { BaseRemote } from '@ssh-keyring/core'

const DefaultAlgorithm = 'ed25519'

const DefaultPublicKeyConfig: BaseRemote['publicKey'] = {
  type: 'spki',
  format: 'pem',
}

const DefaultPrivateKeyConfig: BaseRemote['privateKey'] = {
  type: 'pkcs8',
  format: 'pem',
  cipher: 'des-ede3-cbc',
  passphrase: '',
}

export const generateSshKey = async (config: BaseRemote) => {
  const { publicKey, privateKey } =  generateKeyPairSync(DefaultAlgorithm, {
    publicKeyEncoding: {
      ...DefaultPublicKeyConfig,
      ...config.publicKey,
    },
    privateKeyEncoding: {
      ...DefaultPrivateKeyConfig,
      ...config.privateKey,
    },
  })

  return {
    publicKey: publicKey.export({...DefaultPublicKeyConfig, ...config.publicKey}).toString(),
    privateKey: privateKey.export({...DefaultPrivateKeyConfig, ...config.privateKey}).toString(),
  }
}
