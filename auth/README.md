# auth

## Features

- Controllers
  - EMail Signin
  - Google Signin
  - GoogleOAuth Callback
  - Signout

- Middlewares
  - JWT verification
  - GoogleOAuth token veridation, And refresh token.


## Configure

```
const vironlib = new VironLib({auth: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| auth | Object | no | メール認証、GoogleOAuth認証に必要なミドルウェア、コントローラ |
| auth.admin_roles | Sequelize#Model | yes | `admin_roles` モデル |
| auth.admin_users | Sequelize#Model | yes | `admin_users` モデル |
| auth.super_role | String | yes | スーパーユーザーの権限ID |
| auth.default_role | String | yes | 管理ユーザーが追加された際に付与される初期権限ID |
| auth.auth_jwt | Object | yes | JWTの設定 |
| auth.auth_jwt.algorithm | String | yes | JWT生成に用いるアルゴリズム ex) "RS512" |
| auth.auth_jwt.claims | Object | yes | JWTに含めるclaimセット |
| auth.auth_jwt.claims.iss | String | yes | JWT発行者の識別子 |
| auth.auth_jwt.claims.aud | String | yes | JWT利用者の識別子 |
| auth.google_oauth | Object | no | GoogleOAuthの設定 |
| auth.google_oauth.client_id | String | yes | GoogleOAuthクライアントID |
| auth.google_oauth.client_secret | String | yes | GoogleOAuthクライアントシークレット |
| auth.google_oauth.redirect_url | String | no | Google認証後に呼び出されるViron側のAPI |
| auth.google_oauth.allow_email_domains | Array<String> | no | 利用を許可するドメインの一覧 |
