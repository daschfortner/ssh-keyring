import { KeyConfig } from "@ssh-keyring/types";

export const DefaultAlgorithm: 'ed25519' = 'ed25519'

export const DefaultPublicKeyConfig: KeyConfig['publicKey'] = {
  type: 'spki',
  format: 'pem',
}

export const DefaultPrivateKeyConfig: KeyConfig['privateKey'] = {
  type: 'pkcs8',
  format: 'pem',
  cipher: 'des-ede3-cbc',
  passphrase: '',
}
