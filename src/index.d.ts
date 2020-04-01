interface AppConfig {
  version: string,
  forwardTo: string,
  usagePort: number | undefined,
  defaultLifetime: number,
  pathOptions: { [k: string]: PathOption }
}

interface PathOption {
  lifetime: number
}

interface CacheEntry {
  id: number,
  method: string,
  path: string,
  requestPayload: string,
  responseStatusCode: number,
  responseHeader: string,
  responseBody: string,
  createdOn: number,
  expiredOn: number
}