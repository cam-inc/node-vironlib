const assert = require('assert');
const test = require('../');
const vironlib = test.vironlib;
const swagger = vironlib.swagger;

describe('swagger/controller', () => {

  describe('show', () => {

    const show = swagger.controller.show;

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
      show(req, res);
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
      show(req, res);
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
      show(req, res);
    });

    it('role_idのenum変更に成功', done => {
      Promise.resolve().then(async () => {
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            for (const method of ['get', 'post', 'put', 'delete']) {
              await test.models.AdminRoles.create({
                role_id: `role${i}`,
                method: method,
                resource: `resource${j}`,
              });
            }
          }
        }
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
        show(req, res);
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
      show(req, res);
    });

    it('checklistの自動生成ができる', done => {
      Promise.resolve().then(async () => {
        for (let i = 0; i < 5; i++) {
          for (const method of ['get', 'post', 'put', 'delete']) {
            await test.models.AdminRoles.create({
              role_id: `role${i}`,
              method: method,
              resource: 'r1',
            });
          }
        }
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
        show(req, res);
      });
    });

  });
});
