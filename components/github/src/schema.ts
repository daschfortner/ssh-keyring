import { baseRemoteSchema } from '@ssh-keyring/core'
import { InferType, string } from 'yup'

export const githubRemoteSchema = baseRemoteSchema.shape({
  access_token: string().required(),
  key_title: string(),
  api_host: string(),
})

export type GithubRemote = InferType<typeof githubRemoteSchema>
