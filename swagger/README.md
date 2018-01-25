# swagger

## Features

- Controllers
  - Get swagger.json

- Middlewares
  - Maintain compatibility between `swagger-express-mw` versions

- Helpers
  - Generator of AdminRolePaths
  - Get the port from swagger host


## Configure

```
const vironlib = new VironLib({swagger: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| swagger | Object | no | Swagger取得用コントローラおよびヘルパー関数 |
| swagger.host | String | yes | APIサーバーのホスト名 |
| swagger.store | Sequelize | yes | `sequelize` インスタンス |
