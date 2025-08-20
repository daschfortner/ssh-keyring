import { BaseRemote } from "./schema";

export const DefaultAlgorithm: 'ed25519' = 'ed25519'

export const DefaultPublicKeyConfig: BaseRemote['publicKey'] = {
  type: 'spki',
  format: 'pem',
}

export const DefaultPrivateKeyConfig: BaseRemote['privateKey'] = {
  type: 'pkcs8',
  format: 'pem',
  cipher: 'des-ede3-cbc',
  passphrase: '',
}

export const DefaultConfigPaths: string[] = [
  '~/keyringrc',
  '~/.config/ssh-keyring/keyringrc',
]
