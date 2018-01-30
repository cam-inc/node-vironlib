const assert = require('assert');
const test = require('../');

describe('swagger/controller', () => {
  let controllerSwagger;

  before(() => {
    const vironlib = test.vironlib;
    controllerSwagger = vironlib.swagger.controller;
  });

  describe('show', () => {

    it('swagger.jsonが取得できる', done => {
      const swagger = {
        operation: {
        },
        swaggerObject: {
          paths: {
            '/adminuser': {get: {}, post: {}},
            '/adminrole': {post: {}},
          },
          definitions: {
            UpdateAdminUserPayload: {
              properties: {
                role_id: {
                  enum: ['tester'],
                },
              },
            },
          },
        },
      };
      const req = test.genRequest({swagger});
      const res = test.genResponse();

      res.json = result => {
        assert(result.paths['/adminuser'].get);
        assert(result.paths['/adminuser'].post);
        assert(result.paths['/adminrole'].post);
        done();
      };
      controllerSwagger.show(req, res);
    });

    it('権限のないパスはswagger.jsonから削除される', done => {
      const swagger = {
        operation: {
          security: {
            jwt: ['api:access'],
          },
        },
        swaggerObject: {
          paths: {
            '/adminuser': {get: {}, post: {}},
            '/adminrole': {post: {}},
          },
          definitions: {
            UpdateAdminUserPayload: {
              properties: {
                role_id: {
                  enum: ['tester'],
                },
              },
            },
          },
        },
      };
      const req = test.genRequest({swagger});
      const res = test.genResponse();

      req.auth = {
        roles: {
          get: '*',
        },
      };
      res.json = result => {
        assert(result.paths['/adminuser'].get);
        assert(!result.paths['/adminuser'].post);
        assert(!result.paths['/adminrole']);
        done();
      };
      controllerSwagger.show(req, res);
    });

    it('hostの書き換えができる', done => {
      const swagger = {
        operation: {
        },
        swaggerObject: {
          host: 'http://hoge',
          paths: {
          },
        },
      };
      const req = test.genRequest({swagger});
      const res = test.genResponse();

      res.json = result => {
        assert(result.host === 'localhost:3000');
        done();
      };
      controllerSwagger.show(req, res);
    });

    it('role_idのenum変更に成功', done => {
      Promise.resolve().then(async () => {
        const list = [];
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            for (const method of ['get', 'post', 'put', 'delete']) {
              list.push({
                role_id: `role${i}`,
                method: method,
                resource: `resource${j}`,
              });
            }
          }
        }
        await test.models.AdminRoles.bulkCreate(list);
      }).then(() => {
        const swagger = {
          operation: {
            security: {
              jwt: ['api:access'],
            },
          },
          swaggerObject: {
            paths: {
            },
            definitions: {
              UpdateAdminUserPayload: {
                type: 'object',
                properties: {
                  role_id: {
                    'x-autogen-enum': {
                      model: 'admin_roles',
                      field: 'role_id',
                      defaults: ['super'],
                    }
                  },
                },
              },
            },
          },
        };
        const req = test.genRequest({swagger});
        const res = test.genResponse();

        req.auth = {
          roles: {
            get: '*',
          },
        };

        res.json = result => {
          assert(result.definitions.UpdateAdminUserPayload.properties.role_id.enum.length === 6);
          assert(result.definitions.UpdateAdminUserPayload.properties.role_id.enum.includes('role0'));
          assert(result.definitions.UpdateAdminUserPayload.properties.role_id.enum.includes('super'));
          assert(!result.definitions.UpdateAdminUserPayload.properties.role_id.enum.includes('tester'));
          done();
        };
        controllerSwagger.show(req, res);
      });
    });

    it('AdminRolesが空の場合はsuperのみ', done => {
      const swagger = {
        operation: {
          security: {
            jwt: ['api:access'],
          },
        },
        swaggerObject: {
          paths: {
          },
          definitions: {
            UpdateAdminUserPayload: {
              type: 'object',
              properties: {
                role_id: {
                  'x-autogen-enum': {
                    model: 'admin_roles',
                    field: 'role_id',
                    defaults: ['super'],
                  }
                },
              },
            },
          },
        },
      };
      const req = test.genRequest({swagger});
      const res = test.genResponse();

      req.auth = {
        roles: {
          get: '*',
        },
      };

      res.json = result => {
        assert(result.definitions.UpdateAdminUserPayload.properties.role_id.enum.length === 1);
        assert(result.definitions.UpdateAdminUserPayload.properties.role_id.enum[0] === 'super');
        done();
      };
      controllerSwagger.show(req, res);
    });

    it('checklistの自動生成ができる', done => {
      Promise.resolve().then(async () => {
        const list = [];
        for (let i = 0; i < 5; i++) {
          for (const method of ['get', 'post', 'put', 'delete']) {
            list.push({
              role_id: `role${i}`,
              method: method,
              resource: 'r1',
            });
          }
        }
        await test.models.AdminRoles.bulkCreate(list);
      }).then(() => {
        const swagger = {
          operation: {
            security: {
              jwt: ['api:access'],
            },
          },
          swaggerObject: {
            paths: {
            },
            definitions: {
              TestPayload: {
                type: 'object',
                properties: {
                  check_list: {
                    'x-autogen-checklist': {
                      model: 'admin_roles',
                      field: 'role_id',
                      defaults: ['super'],
                      default: false,
                    }
                  },
                },
              },
            },
          },
        };
        const req = test.genRequest({swagger});
        const res = test.genResponse();

        req.auth = {
          roles: {
            get: '*',
          },
        };

        res.json = result => {
          assert(result.definitions.TestPayload.properties.check_list.type === 'object');
          assert(Object.keys(result.definitions.TestPayload.properties.check_list.properties).length === 6);
          assert(result.definitions.TestPayload.properties.check_list.properties.super.type === 'boolean');
          assert(result.definitions.TestPayload.properties.check_list.properties.super.default === false);
          done();
        };
        controllerSwagger.show(req, res);
      });
    });

  });
});
