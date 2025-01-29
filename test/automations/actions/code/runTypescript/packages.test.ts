import Tester, { expect, describe, it } from 'bun:test'
import { Helpers, type Config } from '/test/bun'
import type { CodeRunnerContext } from '/domain/services/CodeRunner'

const helpers = new Helpers(Tester)

helpers.testWithMockedApp({}, ({ app, request }) => {
  describe('on POST', () => {
    it('should run a Typescript code with the date-fns package', async () => {
      // GIVEN
      const config: Config = {
        name: 'App',
        automations: [
          {
            name: 'getDate',
            trigger: {
              service: 'Http',
              event: 'ApiCalled',
              path: 'get-date',
              output: {
                date: '{{runJavascriptCode.date}}',
              },
            },
            actions: [
              {
                service: 'Code',
                action: 'RunTypescript',
                name: 'runJavascriptCode',
                code: String(async function (context: CodeRunnerContext) {
                  const {
                    packages: { dateFns },
                  } = context
                  const date = dateFns.format(new Date(2024, 8, 1), 'yyyy-MM-dd')
                  return { date }
                }),
              },
            ],
          },
        ],
      }
      const { url } = await app.start(config)

      // WHEN
      const response = await request.post(`${url}/api/automation/get-date`)

      // THEN
      expect(response.date).toBe('2024-09-01')
    })

    it('should run a Typescript code with xml2js package', async () => {
      // GIVEN
      const config: Config = {
        name: 'App',
        automations: [
          {
            name: 'parseXml',
            trigger: {
              service: 'Http',
              event: 'ApiCalled',
              path: 'parse-xml',
              output: {
                result: {
                  json: '{{runJavascriptCode.result}}',
                },
              },
            },
            actions: [
              {
                service: 'Code',
                action: 'RunTypescript',
                name: 'runJavascriptCode',
                code: String(async function (context: CodeRunnerContext) {
                  const {
                    packages: { xml2js },
                  } = context
                  const parser = new xml2js.Parser({
                    trim: true,
                    explicitArray: false,
                  })
                  const xml =
                    '<result><root><item>Value1</item><item>Value2</item></root><key> value </key></result>'
                  const { result } = await parser.parseStringPromise(xml)
                  return { result }
                }),
              },
            ],
          },
        ],
      }
      const { url } = await app.start(config)

      // WHEN
      const response = await request.post(`${url}/api/automation/parse-xml`)

      // THEN
      expect(response.result).toStrictEqual({
        key: 'value',
        root: { item: ['Value1', 'Value2'] },
      })
    })

    it('should run a Typescript code with axios package', async () => {
      // GIVEN
      const config: Config = {
        name: 'App',
        automations: [
          {
            name: 'axios',
            trigger: {
              service: 'Http',
              event: 'ApiCalled',
              path: 'axios',
              output: {
                exist: {
                  boolean: '{{runJavascriptCode.exist}}',
                },
              },
            },
            actions: [
              {
                service: 'Code',
                action: 'RunTypescript',
                name: 'runJavascriptCode',
                code: String(async function (context: CodeRunnerContext) {
                  const {
                    packages: { axios },
                  } = context
                  return { exist: !!axios?.post }
                }),
              },
            ],
          },
        ],
      }
      const { url } = await app.start(config)

      // WHEN
      const response = await request.post(`${url}/api/automation/axios`)

      // THEN
      expect(response.exist).toBeTruthy()
    })

    it('should run a Typescript code with https package', async () => {
      // GIVEN
      const config: Config = {
        name: 'App',
        automations: [
          {
            name: 'https',
            trigger: {
              service: 'Http',
              event: 'ApiCalled',
              path: 'https',
              output: {
                exist: {
                  boolean: '{{runJavascriptCode.exist}}',
                },
              },
            },
            actions: [
              {
                service: 'Code',
                action: 'RunTypescript',
                name: 'runJavascriptCode',
                code: String(async function (context: CodeRunnerContext) {
                  const {
                    packages: { https },
                  } = context
                  return { exist: !!https?.globalAgent }
                }),
              },
            ],
          },
        ],
      }
      const { url } = await app.start(config)

      // WHEN
      const response = await request.post(`${url}/api/automation/https`)

      // THEN
      expect(response.exist).toBeTruthy()
    })

    it('should run a Typescript code with crypto package', async () => {
      // GIVEN
      const config: Config = {
        name: 'App',
        automations: [
          {
            name: 'crypto',
            trigger: {
              service: 'Http',
              event: 'ApiCalled',
              path: 'crypto',
              output: {
                exist: {
                  boolean: '{{runJavascriptCode.exist}}',
                },
              },
            },
            actions: [
              {
                service: 'Code',
                action: 'RunTypescript',
                name: 'runJavascriptCode',
                code: String(async function (context: CodeRunnerContext) {
                  const {
                    packages: { crypto },
                  } = context
                  return { exist: !!crypto?.constants }
                }),
              },
            ],
          },
        ],
      }
      const { url } = await app.start(config)

      // WHEN
      const response = await request.post(`${url}/api/automation/crypto`)

      // THEN
      expect(response.exist).toBeTruthy()
    })

    it('should run a Typescript code with lodash package', async () => {
      // GIVEN
      const config: Config = {
        name: 'App',
        automations: [
          {
            name: 'lodash',
            trigger: {
              service: 'Http',
              event: 'ApiCalled',
              path: 'lodash',
              output: {
                exist: {
                  boolean: '{{runJavascriptCode.exist}}',
                },
              },
            },
            actions: [
              {
                service: 'Code',
                action: 'RunTypescript',
                name: 'runJavascriptCode',
                code: String(async function (context: CodeRunnerContext) {
                  const {
                    packages: { lodash },
                  } = context
                  return { exist: !!lodash?.chunk }
                }),
              },
            ],
          },
        ],
      }
      const { url } = await app.start(config)

      // WHEN
      const response = await request.post(`${url}/api/automation/lodash`)

      // THEN
      expect(response.exist).toBeTruthy()
    })

    it('should run a Typescript code with Notion package', async () => {
      // GIVEN
      const config: Config = {
        name: 'App',
        automations: [
          {
            name: 'notion',
            trigger: {
              service: 'Http',
              event: 'ApiCalled',
              path: 'notion',
              output: {
                exist: {
                  boolean: '{{runJavascriptCode.exist}}',
                },
              },
            },
            actions: [
              {
                service: 'Code',
                action: 'RunTypescript',
                name: 'runJavascriptCode',
                code: String(async function (context: CodeRunnerContext) {
                  const {
                    packages: { Notion },
                  } = context
                  return { exist: !!new Notion() }
                }),
              },
            ],
          },
        ],
      }
      const { url } = await app.start(config)

      // WHEN
      const response = await request.post(`${url}/api/automation/notion`)

      // THEN
      expect(response.exist).toBeTruthy()
    })

    it('should run a Typescript code with Airtable package', async () => {
      // GIVEN
      const config: Config = {
        name: 'App',
        automations: [
          {
            name: 'airtable',
            trigger: {
              service: 'Http',
              event: 'ApiCalled',
              path: 'airtable',
              output: {
                exist: {
                  boolean: '{{runJavascriptCode.exist}}',
                },
              },
            },
            actions: [
              {
                service: 'Code',
                action: 'RunTypescript',
                name: 'runJavascriptCode',
                code: String(async function (context: CodeRunnerContext) {
                  const {
                    packages: { Airtable },
                  } = context
                  return { exist: !!Airtable.base }
                }),
              },
            ],
          },
        ],
      }
      const { url } = await app.start(config)

      // WHEN
      const response = await request.post(`${url}/api/automation/airtable`)

      // THEN
      expect(response.exist).toBeTruthy()
    })
  })
})
