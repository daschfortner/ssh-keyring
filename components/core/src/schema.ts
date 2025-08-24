import { object, string, InferType, number } from 'yup'
import { Logger } from './logger'

export const baseRemoteSchema = object({
  public_key: object({
    type: string().required().oneOf(['spki', 'pkcs1']).nonNullable(),
    format: string().required().oneOf(['pem']).nonNullable(),
  }).optional(),
  private_key: object({
    type: string().required().oneOf(['pkcs1', 'pkcs8', 'sec1']).nonNullable(),
    format: string().required().oneOf(['pem']).nonNullable(),
    cipher: string().optional(),
    passphrase: string().optional(),
  }).optional(),
})

export type BaseRemote = InferType<typeof baseRemoteSchema>

export const pluginSchema = object({
  name: string().required(),
  description: string().required(),
})

export type ConfigurationItem = Record<string, unknown>

export type Plugin = InferType<typeof pluginSchema> & {
  configureRemote: (
    name: string,
    remote: ConfigurationItem,
    publicKey: string,
    logger: Logger,
  ) => Promise<Host>
}

export class PluginError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const hostSchema = object({
  AddressFamily: string().oneOf(['any', 'inet', 'inet6']).nonNullable().optional(),
  BatchMode: string().oneOf(['yes', 'no']).nonNullable().optional(),
  BindAddress: string().oneOf(['yes', 'no']).nonNullable().optional(),
  ChallengeResponseAuthentication: string().oneOf(['yes', 'no']).nonNullable().optional(),
  CheckHostIP: string().oneOf(['yes', 'no']).nonNullable().optional(),
  Cipher: string().oneOf(['blowfish', '3des', 'des']).nonNullable().optional(),
  Ciphers: string().optional(),
  ClearAllForwardings: string().oneOf(['yes', 'no']).nonNullable().optional(),
  Compression: string().oneOf(['yes', 'no']).nonNullable().optional(),
  CompressionLevel: number().min(1).max(9).optional(),
  ConnectionAttempts: number().optional(),
  ConnectTimeout: number().optional(),
  ControlMaster: string().oneOf(['yes', 'no', 'ask', 'auto', 'autoask']).nonNullable().optional(),
  ControlPath: string().optional(),
  DynamicForward: string().optional(),
  EnableSSHKeysign: string().oneOf(['yes', 'no']).nonNullable().optional(),
  EscapeChar: string().max(1).optional(),
  ExitOnForwardFailure: string().oneOf(['yes', 'no']).nonNullable().optional(),
  ForwardAgent: string().oneOf(['yes', 'no']).nonNullable().optional(),
  ForwardX11: string().oneOf(['yes', 'no']).nonNullable().optional(),
  ForwardX11Trusted: string().oneOf(['yes', 'no']).nonNullable().optional(),
  GatewayPorts: string().oneOf(['yes', 'no']).nonNullable().optional(),
  GlobalKnownHostsFile: string().optional(),
  GSSAPIAuthentication: string().oneOf(['yes', 'no']).nonNullable().optional(),
  GSSAPIKeyExchange: string().oneOf(['yes', 'no']).nonNullable().optional(),
  GSSAPIClientIdentity: string().optional(),
  GSSAPIDelegateCredentials: string().oneOf(['yes', 'no']).nonNullable().optional(),
  GSSAPIRenewalForcesRekey: string().oneOf(['yes', 'no']).nonNullable().optional(),
  GSSAPITrustDns: string().oneOf(['yes', 'no']).nonNullable().optional(),
  HashKnownHosts: string().oneOf(['yes', 'no']).nonNullable().optional(),
  HostbasedAuthentication: string().oneOf(['yes', 'no']).nonNullable().optional(),
  HostKeyAlgorithms: string().optional(),
  HostKeyAlias: string().optional(),
  HostName: string().optional(),
  IdentitiesOnly: string().oneOf(['yes', 'no']).nonNullable().optional(),
  IdentityFile: string().optional(),
  KbdInteractiveAuthentication: string().oneOf(['yes', 'no']).nonNullable().optional(),
  KbdInteractiveDevices: string().oneOf(['bsdauth', 'pam', 'skey']).nonNullable().optional(),
  LocalCommand: string().optional(),
  LocalForward: string().optional(),
  LogLevel: string().oneOf(['QUIET', 'FATAL', 'ERROR', 'INFO', 'VERBOSE', 'DEBUG', 'DEBUG1', 'DEBUG2', 'DEBUG3']).nonNullable().optional(),
  MACs: string().optional(),
  NumberOfPasswordPrompts: number().optional(),
  PasswordAuthentication: string().oneOf(['yes', 'no']).nonNullable().optional(),
  PermitLocalCommand: string().oneOf(['yes', 'no']).nonNullable().optional(),
  Port: number().optional(),
  PreferredAuthentications: string().optional(),
  Protocol: string().oneOf(['1', '2', '1,2', '2,1']).nonNullable().optional(),
  ProxyCommand: string().optional(),
  PubkeyAuthentication: string().oneOf(['yes', 'no']).nonNullable().optional(),
  RekeyLimit: string().optional(),
  RemoteForward: string().optional(),
  RhostsRSAAuthentication: string().oneOf(['yes', 'no']).nonNullable().optional(),
  RSAAuthentication: string().oneOf(['yes', 'no']).nonNullable().optional(),
  SendEnv: string().optional(),
  ServerAliveCountMax: number().optional(),
  ServerAliveInterval: number().optional(),
  SmartcardDevice: string().optional(),
  StrictHostKeyChecking: string().oneOf(['yes', 'no']).nonNullable().optional(),
  TCPKeepAlive: string().oneOf(['yes', 'no']).nonNullable().optional(),
  Tunnel: string().oneOf(['yes', 'point-to-point', 'ethernet', 'no']).nonNullable().optional(),
  TunnelDevice: string().optional(),
  UsePrivilegedPort: string().oneOf(['yes', 'no']).nonNullable().optional(),
  User: string().optional(),
  UserKnownHostsFile: string().optional(),
  VerifyHostKeyDNS: string().oneOf(['yes', 'no']).nonNullable().optional(),
  VisualHostKey: string().oneOf(['yes', 'no']).nonNullable().optional(),
  XAuthLocation: string().optional(),
})

export type Host = InferType<typeof hostSchema>
