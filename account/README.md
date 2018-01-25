# account

## Features

- Controllers
  - Update self settings

## Configure

```
const vironlib = new VironLib({account: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| account | Object | no | アカウント設定（管理ユーザー自身によるパスワード変更機能）のコントローラ |
| account.admin_users | Sequelize#Model | yes | `admin_users` モデル |
