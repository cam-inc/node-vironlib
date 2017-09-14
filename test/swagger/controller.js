const assert = require('assert');
const test = require('../');
const vironlib = test.vironlib;
const swagger = vironlib.swagger;
const times = require('mout/function/times');

describe('swagger/controller', () => {

  describe('show', () => {

    beforeEach(() => {
      times(5, i => {
        times(5, j => {
          ['get', 'post', 'put', 'delete'].forEach(method => {
            test.models.AdminRoles.create({
              role_id: `role${i}`,
              method: method,
              resource: `resource${j}`,
            });
          });
        });
      });
    });

    const show = swagger.controller.show;

    it('swagger.jsonが取得できる', async() => {
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
      };
      await show(req, res);
    });

    it('権限のないパスはswagger.jsonから削除される', async() => {
      const swagger = {
        operation: {
          security: {
            jwt: ['api:access'],
          },
        },
        swaggerObject: {
          paths: {
            '/adminuser': {get: {'x-ref': [{method: 'post', path: '/adminuser'}]}, post: {}},
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
        assert(!result.paths['/adminuser'].get['x-ref']);
        assert(!result.paths['/adminuser'].post);
        assert(!result.paths['/adminrole']);
      };
      await show(req, res);
    });

    it('hostの書き換えができる', async() => {
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
      };
      await show(req, res);
    });

    it('role_idのenum変更に成功', async() => {
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
        assert(result.definitions.UpdateAdminUserPayload.properties.role_id.enum.length === 6);
        assert(result.definitions.UpdateAdminUserPayload.properties.role_id.enum.includes('role0'));
        assert(result.definitions.UpdateAdminUserPayload.properties.role_id.enum.includes('super'));
        assert(!result.definitions.UpdateAdminUserPayload.properties.role_id.enum.includes('tester'));
      };
      await show(req, res);
    });

  });
});
