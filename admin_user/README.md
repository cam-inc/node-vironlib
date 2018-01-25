# admin_user

## Features

- Controllers
  - CRUD of `admin_users` table.

## Configure

```
const vironlib = new VironLib({admin_user: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| admin_user | Object | no | 管理ユーザー情報のコントローラ | 
| admin_user.admin_users | Sequelize#Model | yes | `admin_users` モデル |
| admin_user.default_role | String | yes | 管理ユーザーが追加された際に付与される初期権限ID |
