import { KeyConfig } from "@ssh-keyring/types";

export type GithubConfiguration = KeyConfig & {
  token: string
  hostname?: string
  name?: string
}
