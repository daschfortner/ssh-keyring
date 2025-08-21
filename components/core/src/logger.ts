export type Logger = {
  debug: (message?: string) => void
  info: (message?: string) => void
  log: (message?: string) => void
  error: (message?: string) => void
}

export const LogLevels = ['debug', 'info', 'log', 'error'] as const

type LogLevel = typeof LogLevels[number]

type LogLevelCreator = (logLevel: LogLevel) => Logger

export const createLogger: LogLevelCreator = (logLevel: LogLevel) => ({
  debug: (message?: string) => {
    if (logLevel === 'debug') {
      console.log(message)
    }
  },
  info: (message?: string) => {
    if (['debug', 'info'].includes(logLevel)) {
      console.info(message)
    }
  },
  log: (message?: string) => {
    if (['debug', 'info', 'log'].includes(logLevel)) {
      console.log(message)
    }
  },
  error: (message?: string) => {
    console.error(message)
  }
})
