# node-vironlib
Generic library for Viron

# Description

Viron用のNode.jsライブラリです

# Features

- [x] 認証
  - [x] GoogleOAuth
  - [x] email/password
- [x] 管理権限
- [x] 管理ユーザー
- [x] 監査ログ
- [x] CORS
- [x] Pagination


# QuickStart

## Install
```
$ npm install node-vironlib --registry https://camobile.jfrog.io/camobile/api/npm/camplat-virtual/
```

## Configure
```
const VironLib = require('node-vironlib');
const vironlib = new VironLib({
  acl: {
    allow_origin: '*',
    allow_headers: 'X-Requested-With, Origin, Content-Type, Accept, Authorization X-Pagination-Limit, X-Pagination-Total-Pages, X-Pagination-Current-Page',
    expose_headers: 'X-Requested-With, Origin, Content-Type, Accept, Authorization, X-Pagination-Limit, X-Pagination-Total-Pages, X-Pagination-Current-Page',
  },
  audit_log: {
    audit_logs: {{Sequelize.Model}}
  },
  admin_user: {
    admin_users: {{Sequelize.Model}},
    default_role: 'viewer',
  },
  admin_role: {
    admin_roles: {{Sequelize.Model}},
    admin_users: {{Sequelize.Model}},
    store: {{Sequelize}},
    default_role: 'viewer',
  },
  auth: {
    admin_users: {{Sequelize.Model}},
    admin_roles: {{Sequelize.Model}},
    super_role: 'super',
    default_role: 'viewer',
    auth_jwt: {
      algorithm: 'RS512', // RS256,RS384,RS512,HS256,HS384,HS512
      claims: {
        iss: 'issuer',
        aud: 'audience',
      },
      // for HMAC
      secret: '...',
      // for RSA
      rsa_private_key: '...',
      rsa_public_key: '...',
    },
    google_oauth: {
      client_id: '99999999999-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com',
      client_secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      redirect_url: 'https://localhost:3000/googleoauth2callback',
      allow_email_domains: [
        'your.organization.com',
      ],
    },
  },
  autocomplete: {
    store: {{Sequelize}},
  },
  pager: {
    limit: 100,
  },
  swagger: {
    host: 'localhost:3000',
    admin_roles: {{Sequelize.Model}},
    super_role: 'super',
  },
  logger: {{Logger}},
  body_completion: {
    exclude_paths: ['/user'],
  },
});
```

# Tools

```
npm run
```
