import { generateKeyPairSync } from 'node:crypto'
import { BaseRemote } from '@ssh-keyring/core'

const DefaultAlgorithm = 'ed25519'

const DefaultPublicKeyConfig: BaseRemote['public_key'] = {
  type: 'spki',
  format: 'pem',
}

const DefaultPrivateKeyConfig: BaseRemote['private_key'] = {
  type: 'pkcs8',
  format: 'pem',
  cipher: 'des-ede3-cbc',
  passphrase: '',
}

export const generateSshKey = async (config: BaseRemote) => {
  const { publicKey, privateKey } =  generateKeyPairSync(DefaultAlgorithm, {
    publicKeyEncoding: {
      ...DefaultPublicKeyConfig,
      ...config.public_key,
    },
    privateKeyEncoding: {
      ...DefaultPrivateKeyConfig,
      ...config.private_key,
    },
  })

  return {
    publicKey: publicKey.export({...DefaultPublicKeyConfig, ...config.public_key}).toString(),
    privateKey: privateKey.export({...DefaultPrivateKeyConfig, ...config.private_key}).toString(),
  }
}
