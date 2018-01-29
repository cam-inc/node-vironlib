# node-vironlib
Generic library for [Viron](https://github.com/cam-inc/viron/)

[![npm](https://nodei.co/npm/node-vironlib.png)](https://nodei.co/npm/node-vironlib/)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![npm](https://img.shields.io/npm/dt/node-vironlib.svg)](README.md)
[![node](https://img.shields.io/node/v/node-vironlib.svg)](README.md)


[日本語 README](README.ja.md)

## Description

node-vironlib is a helper library that makes it easy to implement functions that would normally be needed with Viron API Server.

## Features

- [x] [Authentication](auth)
  - [x] GoogleOAuth
  - [x] email/password
- [x] [Admin Role](admin_role)
- [x] [Admin User](admin_user)
- [x] [Audit Log](audit_log)
- [x] [Access Control for CORS](acl)
- [x] [Pager](pager)
- [x] [Auto Complete](autocomplete)


## QuickStart

### Install
```
$ npm install node-vironlib
```

### Usage
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

## Test
```
npm test
```

## Copyright

CA Mobile, Inc. All rights reserved.

## LICENSE

@see : [LICENSE](LICENSE)
