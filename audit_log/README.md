# audit_log

## Features

- Controllers
  - View `audit_logs` table.

- Middlewares
  - Save requests to `audit_logs` table.

## Configure

```
const vironlib = new VironLib({audit_log: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| audit_log | Object | no | 監査ログを取得するミドルウェア、および閲覧用のコントローラ |
| audit_log.audit_logs | Sequelize#Model | yes | `audit_logs` モデル |
| audit_log.unless | Object | no | 監査ログ取得を除外する設定 [express-unless](https://github.com/jfromaniello/express-unless) |
