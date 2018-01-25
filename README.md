# node-vironlib
Generic library for [Viron](https://github.com/cam-inc/viron/)

[![npm](https://nodei.co/npm/node-vironlib.png)](https://nodei.co/npm/node-vironlib/)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![npm](https://img.shields.io/npm/dt/node-vironlib.svg)]()
[![node](https://img.shields.io/node/v/node-vironlib.svg)]()

## Description

node-vironlib is a helper library of Viron API Server.
That makes communicating with the Viron easy.

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
- [x] [Swagger Validator](swagger_validator)


## QuickStart

### Install
```
$ npm install node-vironlib
```

### Configure
```
const VironLib = require('node-vironlib');
const vironlib = new VironLib({...});
```

@see [Documentation](https://cam-inc.github.io/viron-doc/docs/adv_vironlib.html)

## Test
```
npm test
```

## Copyright

CA Mobile, Inc. All rights reserved.

## LICENSE

@see : [LICENSE](LICENSE)
