// eslint-disable-next-line no-unused-vars
import { IncomingHttpHeaders } from "http"
// eslint-disable-next-line no-unused-vars
import fetch, { Response } from 'node-fetch'
import config from './config'

export const doGetRequest = function(url: string, headers: {[key: string]: string}) : Promise<Response> {
  delete headers['host']
  return fetch(config.forwardTo + url, {
    method: 'GET',
    headers: headers
  })
}

export const doPostRequest = function(url: string, headers: {[key: string]: string}, payload: string | undefined) : Promise<Response> {
  delete headers['host']
  return fetch(config.forwardTo + url, {
    method: 'POST',
    headers: headers,
    body: payload
  })
}