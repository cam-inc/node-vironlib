# node-vironlib
Generic library for [Viron](https://github.com/cam-inc/viron/)

[![npm](https://nodei.co/npm/node-vironlib.png)](https://nodei.co/npm/node-vironlib/)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![npm](https://img.shields.io/npm/dt/node-vironlib.svg)](README.md)
[![node](https://img.shields.io/node/v/node-vironlib.svg)](README.md)

## 概要

node-vironlibは、Viron API Serverで一般的に必要になるであろう機能を容易に実装出来るようにするヘルパーライブラリです。

## 機能

- [x] [認証](auth)
  - [x] Google OAuth
  - [x] e-mail/password
- [x] [アクセス権限(ロール)](admin_role)
- [x] [ユーザ管理](admin_user)
- [x] [監査ログ](audit_log)
- [x] [Access Control for CORS](acl)
- [x] [ページャー](pager)
- [x] [オートコンプリート](autocomplete)


## クイックスタート

### インストール
```
$ npm install node-vironlib
```

### 組み込み方法

```
const app = require('express')();
const VironLib = require('node-vironlib');
const vironlib = new VironLib({...}); // @see https://cam-inc.github.io/viron-doc/docs/adv_vironlib.html

// middleware
app.use(vironlib.swagger.middlware());
app.use(vironlib.auditLog.middleware());
app.use(vironlib.auth.google.middleware());
app.use(vironlib.adminRole.middleware());
app.use(vironlib.bodyCompletion.middleware());

// controller
app.post(vironlib.auth.controller.signIn);
app.post(vironlib.auth.controller.signOut);
app.get(vironlib.swagger.controller.show);
...
```

## テスト
```
npm test
```

## Migration

- [migration.ja.md](migration.ja.md)
  - > 1.7.0

## Copyright

CA Mobile, Inc. All rights reserved.

## LICENSE

@see : [LICENSE](LICENSE)
