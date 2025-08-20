export type Logger = {
  debug: (...args: string[]) => void
  info: (...args: string[]) => void
  error: (...args: string[]) => void
}

export const LogLevels = ['debug', 'info', 'error'] as const

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
  error: (message?: string) => {
    console.error(message)
  }
})
