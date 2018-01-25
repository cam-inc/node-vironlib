# acl

## Features

- Middlewares
  - Set Access-Control Response Headers.

## Configure

```
const vironlib = new VironLib({acl: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| acl | Object | no | `Access-Control` レスポンスヘッダを付加するミドルウェア |
| acl.allow_origin | String | no | `Access-Control-Allow-Origin` に設定する値 |
| acl.allow_headers | String | no | `Access-Control-Allow-Headers` に設定する値 |
| acl.expose_headers | String | no | `Access-Control-Expose-Headers` に設定する値 |
