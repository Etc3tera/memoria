import express from 'express'
import config from './config'
import bodyParser from 'body-parser'
import { getGetMethodCache, getPostMethodCache, cache } from './cache-manager'
import { doGetRequest, doPostRequest } from './client'
import { METHOD_POST, METHOD_GET } from './constant'
const app = express()
const port = config.usagePort || 10300

app.use(bodyParser.json())

console.log(config)

app.get('*', async (req, res) => {
  const cachedEntry = await getGetMethodCache(req.url)
  if (!cachedEntry) {
    try {
      const response = await doGetRequest(req.url, req.headers as {[key: string]: string})
      const statusCode = response.status
      const headers = prettifyHeader(response.headers.raw())
      const body = await response.text()
      await cache(METHOD_GET, req.url, '', statusCode, headers, body)

      filterHeaders(headers)
      res.set(headers).status(statusCode).send(body)
    } catch(err) {
      console.log(err)
      res.send(err).status(500)
    }
  } else {
    const headers = JSON.parse(cachedEntry.responseHeader)
    filterHeaders(headers)
    res.set(headers)
    res.send(cachedEntry.responseBody).status(cachedEntry.responseStatusCode)
  }
})
app.post('*', async (req, res) => {
  let payload = ''
  if (req.body) {
    payload = JSON.stringify(req.body)
  }
  
  const cachedEntry = await getPostMethodCache(req.url, payload)
  if (!cachedEntry) {
    try {
      const response = await doPostRequest(req.url, req.headers as {[key: string]: string}, payload)
      const statusCode = response.status
      const headers = prettifyHeader(response.headers.raw())
      const body = await response.text()
      await cache(METHOD_POST, req.url, payload, statusCode, headers, body)

      filterHeaders(headers)
      res.set(headers).status(statusCode).send(body)
    } catch(err) {
      console.log(err)
      res.send(err).status(500)
    }
  } else {
    const headers = JSON.parse(cachedEntry.responseHeader)
    filterHeaders(headers)
    res.set(headers)
    res.status(cachedEntry.responseStatusCode)
    res.send(cachedEntry.responseBody)
  }
})

app.listen(port, () => console.log(`Memoria version ${config.version} run on port ${port}!`))

function prettifyHeader(headers: {[k: string]: string[]}) : any {
  const newHeaders:{[k: string]: any} = {}
  Object.keys(headers).forEach(key => {
    if (headers[key].length === 1)
      newHeaders[key] = headers[key][0]
    else
      newHeaders[key] = headers[key]
  })

  return newHeaders
}

function filterHeaders(headers: any) {
  delete headers['transfer-encoding']
  delete headers['content-encoding']
  delete headers['x-powered-by']
  delete headers['vary']
  delete headers['server']
  delete headers['date']
}