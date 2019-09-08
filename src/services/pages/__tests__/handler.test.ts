import { create, list, retrieve, update } from '../handler'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { hash } from '../hasher'

process.env.APP_SECRET = 'testing'

const email = 'user@test.me'
const logged_in_at = new Date().toISOString()
const kasl_key = hash(`${email}${logged_in_at}`)

describe('Records handler: create', () => {
  it('should create record', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent({
        title: 'A Test',
        contents: '# Testing',
      }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should result in an error if auth key not present', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        {},
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should result in an error if no valid auth key', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'xxx' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should result in an error if no data in request', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(undefined, { 'kasl-key': 'xxx' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should result in an error if no data in request', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'more errors' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should default to error 500 on system error', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'error' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 500)
  })
})

describe('Records handler: list', () => {
  it('should list records', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}, {}) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should also provide user info if kasl_key passed in request', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    const body = JSON.parse(actual['body'])
    const user = {
      id: 69,
      email,
      logged_in_at,
    }
    expect(body).toHaveProperty('data', { user })
  })

  it('should result in error if kasl-key passed was invalid', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}, { 'kasl-key': 'xxx' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should set statusCode if error contains status value', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}, { 'kasl-key': 'more errors' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should default to error 500 on system error', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}, { 'kasl-key': 'error' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 500)
  })
})

describe('Records handler: retrieve', () => {
  it('should retrieve record', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await retrieve(
      mockEvent({}, {}) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should retrieve record with auth user if kasl-key is valid', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await retrieve(
      mockEvent({}, undefined, { slug: 'not-found' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should respond with forbidden if kasl-key is invalid', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await retrieve(
      mockEvent({}, { 'kasl-key': 'xxx' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })
})

const pathParameters = { id: 1 }
describe('Records handler: update', () => {
  it('should update record', async () => {
    const spyCallback = jest.fn()
    const actual = await update(
      mockEvent(
        {
          title: 'A Test',
          contents: '# Testing',
        },
        undefined,
        pathParameters,
        'POST',
      ) as APIGatewayProxyEvent,
      {} as any,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should result in an error if auth key not present', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await update(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        {},
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should result in an error if no valid auth key', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await update(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'xxx' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should result in an error if no data in request', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await update(
      mockEvent(undefined, { 'kasl-key': 'xxx' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should result in an error if no data in request', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await update(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'more errors' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should default to error 500 on system error', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await update(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'error' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 500)
  })
})

// Mocks at the bottom as we rarely modify them
jest.mock('aws-sdk/clients/ssm', () => {
  return jest.fn().mockImplementation(() => ({
    getParameters: jest.fn(() => ({
      promise: jest.fn(() => ({
        Parameters: [],
      })),
    })),
  }))
})

const spyEnd = jest.fn()
jest.mock('massive', () =>
  jest.fn(() => ({
    withConnection: jest.fn(() => spyEnd),
    saveDoc: jest.fn((undefined, doc) => {
      if (doc.contents === 'error') {
        throw 'Generic error'
      }
      return doc
    }),
    pages: {
      findDoc: jest.fn(filter => {
        if (filter.contents === 'error') {
          throw 'Generic error'
        }
        if (filter.id === 'error') {
          throw 'Generic error'
        }
        console.log('filter', filter)
        if (filter.slug === 'not-found') {
          return []
        }
        return [filter]
      }),
      updateDoc: jest.fn(filter => filter),
    },
    users: {
      findDoc: jest.fn(filter => {
        if (filter.kasl_key === 'error') {
          throw {
            message: 'Generic error',
          }
        }

        if (filter.kasl_key === 'more errors') {
          throw {
            errors: { title: 'any.required' },
            message: 'Generic error',
            status: 400,
          }
        }
        return [
          {
            id: 69,
            email,
            logged_in_at,
          },
        ]
      }),
    },
  })),
)

const getBodyString = JSON.stringify
const mockEvent = (
  data?: {},
  headers: {} = { 'kasl-key': kasl_key },
  pathParameters: {} = {},
  httpMethod: string = 'GET',
) => ({
  body: getBodyString(data),
  headers,
  httpMethod,
  pathParameters,
  multiValueHeaders: {},
})
