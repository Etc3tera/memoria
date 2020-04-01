# Memoria

Memoria is a simple HTTP cache server created by NodeJS. It is useful as cached proxy between Test Module and Real API to decrease the number of calls used.

# Cache-Hit rule

The rule that Memoria use to determine that request has already cached or not are:
 - HTTP Method Name (GET or POST)
 - Path (not include basePath)
 - requestBody (only apply in POST method)

If matches, cached data will be return

# Quick Startup

1. After pull this repo run

```
npm install
```

2. Create `config.json` in root directory, like this one
```
{
    "forwardTo": "https://url:port",
    "pathOptions": {
        "/api/v2/token": {
            "lifetime": 300
        }
    }
}
```

## Available Options

| Key  | Type | Is Required | Default Value |
| ---  | ---- | ----------- | ------------- |
| forwardTo | string | yes | - |
| usagePort | number | no | 10300
| defaultLifetime | number | no | 2592000 |
| pathOptions | {string: PathOption} | no | {} |

### Description:
 - `forwardTo`: Target Base Path. Can include port.
 - `defaultLifetime`: Default cache expiry time.
 - `pathOptions`: Use to declare options on each request path.

## PathOptions Object

| key | Type | Is Required | Default Value |
| --- | ---- | ----------- | ------------- |
| lifetime | number | no | `defaultLifetime` |

3. Start Memoria with command

```
npm run start
```