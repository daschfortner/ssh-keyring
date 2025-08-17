import { KeyConfig } from "@ssh-keyring/types"
import { DefaultAlgorithm, DefaultPrivateKeyConfig, DefaultPublicKeyConfig } from "./defaults"
import { generateSshKey } from "./generateSshKey"

describe('generateSshKey', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fills in default parameters for missing configurations', () => {
    jest.mock('node:crypto', () => ({
      generateKeyPairSync: (alg: string, options: object) => {
        expect(alg).toBe(DefaultAlgorithm)
        expect(options).toMatchObject({
          publicKeyEncoding: DefaultPublicKeyConfig,
          privateKeyEncoding: DefaultPrivateKeyConfig,
        })
      }
    }))

    generateSshKey({})
  })

  it('uses configured values if parameters configured', () => {
    const expectedConfiguration: { publicKeyEncoding: KeyConfig['publicKey'], privateKeyEncoding: KeyConfig['privateKey'] } = {
      publicKeyEncoding: {
        format: 'jwk'
      },
      privateKeyEncoding: {
        format: 'jwk',
        passphrase: 'super secret passphrase',
      }
    }

    jest.mock('node:crypto', () => ({
      generateKeyPairSync: (alg: string, options: object) => {
        expect(alg).toBe(DefaultAlgorithm)
        expect(options).toMatchObject(expectedConfiguration)
      }
    }))

    generateSshKey({
      privateKey: expectedConfiguration.privateKeyEncoding,
      publicKey: expectedConfiguration.publicKeyEncoding,
    })
  })
})
