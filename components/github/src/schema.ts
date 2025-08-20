import { baseRemoteSchema } from '@ssh-keyring/core'
import { InferType, string } from 'yup'

export const githubRemoteSchema = baseRemoteSchema.shape({
  accessToken: string().required(),
  keyTitle: string(),
})

export type GithubRemote = InferType<typeof githubRemoteSchema>
