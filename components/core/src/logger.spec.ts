import { createLogger } from "./logger"

describe('createLogger', () => {
  const realLog = console.log
  const realInfo = console.info
  const realError = console.error

  beforeEach(() => {
    console.log = jest.fn()
    console.info = jest.fn()
    console.error = jest.fn()
  })

  afterEach(() => {
    console.log = realLog
    console.info = realInfo
    console.error = realError
  })

  it('prints everything for debug log level', () => {
    const logger = createLogger('debug')

    logger.debug('test')

    expect(console.log).toHaveBeenCalledWith('test')

    logger.info('test')

    expect(console.info).toHaveBeenCalledWith('test')

    logger.error('test')

    expect(console.error).toHaveBeenCalledWith('test')
  })

  it('prints info, log, and error logs for log level "info"', () => {
    const logger = createLogger('info')

    logger.debug('test')

    expect(console.log).not.toHaveBeenCalled()

    logger.info('test')

    expect(console.info).toHaveBeenCalledWith('test')

    logger.error('test')

    expect(console.error).toHaveBeenCalledWith('test')
  })

  it('prints log and error logs for log level "log"', () => {
    const logger = createLogger('error')

    logger.debug('test')

    expect(console.log).not.toHaveBeenCalled()

    logger.info('test')

    expect(console.info).not.toHaveBeenCalled()

    logger.error('test')

    expect(console.error).toHaveBeenCalledWith('test')
  })

  it('prints only error logs for log level "error"', () => {

  })
})
