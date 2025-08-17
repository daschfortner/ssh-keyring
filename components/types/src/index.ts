export type Plugin = {
  name: string
  description: string
  run: (args: string[]) => Promise<void>
}

export type KeyConfig = {
  publicKey?: {
    type?: 'spki' | 'pkcs1'
    format?: 'pem' | 'der' | 'jwk'
  }
  privateKey?: {
    type?: 'pkcs1' | 'pkcs8' | 'sec1'
    format?: 'pem' | 'der' | 'jwk'
    cipher?: string
    passphrase?: string
  }
}
