# admin_role

## Features

- Controllers
  - CRUD of `admin_roles` table.

- Middlewares
  - Verify whether the request have permission

## Configure

```
const vironlib = new VironLib({admin_role: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| admin_role | Object | no | 管理権限をチェックするミドルウェア、および管理権限のコントローラ |
| admin_role.admin_roles | Sequelize#Model | yes | `admin_roles` モデル |
| admin_role.admin_users | Sequelize#Model | yes | `admin_users` モデル |
| admin_role.store | Sequelize | yes | `sequelize` インスタンス |
| admin_role.default_role | String | yes | 管理ユーザーが追加された際に付与される初期権限ID |
| admin_role.super_role | String | no | スーパーユーザーの権限ID |
