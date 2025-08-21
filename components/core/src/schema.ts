import { object, string, InferType, number } from 'yup'

export const baseRemoteSchema = object({
  publicKey: object({
    type: string().oneOf(['spki', 'pkcs1']).nonNullable(),
    format: string().oneOf(['pem', 'der', 'jwk']).nonNullable(),
  }).optional(),
  privateKey: object({
    type: string().oneOf(['pkcs1', 'pkcs8', 'sec1']).nonNullable(),
    format: string().oneOf(['pem', 'der', 'jwk']).nonNullable(),
    cipher: string().nonNullable(),
    passphrase: string().nonNullable(),
  }).optional(),
})

export type BaseRemote = InferType<typeof baseRemoteSchema>

export const pluginSchema = object({
  name: string().required(),
  description: string().required(),
})

export type ConfigurationItem = { [key: string]: unknown }

export type Plugin = InferType<typeof pluginSchema> & {
  configureRemote: (
    name: string,
    remote: ConfigurationItem,
    args: string[],
  ) => Promise<string>
}
