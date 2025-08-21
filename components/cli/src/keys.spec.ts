import { BaseRemote } from '@ssh-keyring/core'
import { generateSshKey } from './keys'

describe('generateSshKey', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fills in default parameters for missing configurations', () => {
    jest.mock('node:crypto', () => ({
      generateKeyPairSync: (alg: string, options: object) => {
        expect(alg).toBe('ed25519')
        expect(options).toMatchObject({
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'des-ede3-cbc',
            passphrase: '',
          },
        })
      },
    }))

    generateSshKey({})
  })

  it('uses configured values if parameters configured', () => {
    const expectedConfiguration: {
      publicKeyEncoding: BaseRemote['publicKey']
      privateKeyEncoding: BaseRemote['privateKey']
    } = {
      publicKeyEncoding: {
        format: 'jwk',
      },
      privateKeyEncoding: {
        format: 'jwk',
        passphrase: 'super secret passphrase',
      },
    }

    jest.mock('node:crypto', () => ({
      generateKeyPairSync: (alg: string, options: object) => {
        expect(alg).toBe('ed25519')
        expect(options).toMatchObject(expectedConfiguration)
      },
    }))

    generateSshKey({
      privateKey: expectedConfiguration.privateKeyEncoding,
      publicKey: expectedConfiguration.publicKeyEncoding,
    })
  })
})
