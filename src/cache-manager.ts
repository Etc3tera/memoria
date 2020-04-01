import sqlite3 from 'sqlite3'
import sha1 from './sha1'
import { METHOD_POST, METHOD_GET } from './constant'
import config from './config'
import chalk from 'chalk'
const db = new sqlite3.Database('cache.db')
createTableIfNotExist()

export const cache = async function(method: string, path: string, payload: string, responseStatusCode: number, responseHeader: any , responseBody: string) : Promise<void> {
  return new Promise((resolve, reject) => {
    let hash = '';
    if (payload) {
      hash = sha1(payload)
    }
    const createdTime = getCurrentTime()
    const expiredTime = createdTime + (config.pathOptions[path] ? (config.pathOptions[path].lifetime || config.defaultLifetime) : config.defaultLifetime)

    db.run(`INSERT INTO caches (method, path, requestPayload, requestHash, responseStatusCode, responseHeader, responseBody, createdOn, expiredOn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        method,
        path,
        payload,
        hash,
        responseStatusCode,
        JSON.stringify(responseHeader),
        responseBody,
        createdTime,
        expiredTime
      ], (err) => 
      {
        if (err)
          reject(err)
        else
          resolve()
      }
    )
  })
}

export const getGetMethodCache = function(path: string) : Promise<CacheEntry> {
  return new Promise((resolve, reject) => {
    const currentTime = getCurrentTime()
    db.get(`SELECT * FROM caches WHERE method = ? AND path = ?`, [METHOD_GET, path], async (err, row) => {
      if (err)
        reject(err)
      else {
        if (row) {
          const model = rowResult(row)
          if (model.expiredOn <= currentTime) {
            await removeExpiredEntry(model.id)
            resolve(null)
            console.log(`${chalk.yellow('[RENEW]')} GET ${path}`)
          }
          else {
            resolve(model)
            console.log(`${chalk.cyan('[CACHED]')} GET ${path}`)
          }
        } else {
          resolve(null)
          console.log(`${chalk.green('[NEW]')} GET ${path}`)
        }
      }
    })
  })
}

export const getPostMethodCache = function(path: string, payload: string) : Promise<CacheEntry> {
  return new Promise((resolve, reject) => {
    let hash = ''
    if (payload) {
      hash = sha1(payload)
    }
    const currentTime = getCurrentTime()

    db.get(`SELECT * FROM caches WHERE method = ? AND path = ? AND requestHash = ?`, [METHOD_POST, path, hash], async (err, row) => {
      if (err)
        reject(err)
      else {
        if (row) {
          const model = rowResult(row)
          if (model.expiredOn <= currentTime) {
            await removeExpiredEntry(model.id)
            resolve(null)
            console.log(`${chalk.yellow('[RENEW]')} POST ${path} [hash=${hash}]`)
          }
          else {
            resolve(model)
            console.log(`${chalk.cyan('[CACHED]')} POST ${path} [hash=${hash}]`)
          }
        } else {
          resolve(null)
          console.log(`${chalk.green('[NEW]')} POST ${path} [hash=${hash}]`)
        }
      }
    })
  })
}

function getCurrentTime() : number {
  return Math.floor(new Date().valueOf() / 1000)
}

function rowResult(row: any) : CacheEntry {
  return {
    id: row['id'],
    method: row['method'],
    path: row['path'],
    requestPayload: '',
    responseStatusCode: row['responseStatusCode'],
    responseHeader: row['responseHeader'],
    responseBody: row['responseBody'],
    createdOn: row['createdOn'],
    expiredOn: row['expiredOn']
  } as CacheEntry;
}

async function removeExpiredEntry(id: number) : Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM caches WHERE id = ?', [id], (err) => {
      if (err)
        reject(err)
      else
        resolve()
    })
  })
}

function createTableIfNotExist() {
  db.get(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'caches'`, (err, row) => {
    if (!row) {
      db.run(`CREATE TABLE IF NOT EXISTS caches (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        method TEXT,
        path TEXT,
        requestPayload TEXT,
        requestHash TEXT,
        responseStatusCode INTEGER,
        responseHeader TEXT,
        responseBody TEXT,
        createdOn INTEGER,
        expiredOn INTEGER
      );`, () => {
        db.run(`CREATE INDEX idx_request_hash ON caches (requestHash)`)
      })
    }
  })
}