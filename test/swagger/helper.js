const assert = require('assert');
const vironlib = require('../').vironlib;
const swagger = vironlib.swagger;
const test = require('../');
const times = require('mout/function/times');

describe('swagger/helper', () => {

  describe('getPort', () => {

    const getPort = swagger.helper.getPort;

    it('swaggerに記述されたhostからportを取得できる', () => {
      const swaggerExpress = {
        runner: {
          swagger: {
            host: 'localhost:3000',
          },
        },
      };

      const result = getPort(swaggerExpress, 8080);
      assert(result === 3000);
    });

    it('デフォルト値が取得できる', () => {
      const swaggerExpress = {
        runner: {
          swagger: {
          },
        },
      };

      const result = getPort(swaggerExpress, 8080);
      assert(result === 8080);
    });
  });

  describe('autoGenerate', () => {

    beforeEach(() => {
      times(10, i => {
        test.models.AdminRoles.create({
          role_id: `role${i}`,
          method: 'GET'
        });
      });
    });

    const autoGenerate = swagger.helper.autoGenerate;
    const swaggerExpress = {
      runner: {
        swagger: {
          definitions: {
            adminrolepath: {
              properties: {
                path: {
                  enum: [],
                },
              },
            },
            UpdateAdminUserPayload: {
              properties: {
                role_id: {
                  enum: [],
                },
              },
            },
          },
          paths: {
            '/adminuser': {get: {}, post: {}},
            '/adminuser/{id}': {get: {}, put: {}, delete: {}},
            '/adminrole': {get: {}, post: {}},
            '/adminrole/{id}': {get: {}, put: {}, delete: {}},
            '/signin': {post: {}},
          },
        },
      },
    };

    it('自動生成されたパスがadminrolepathのenumにセットされる', async() => {
      await autoGenerate(swaggerExpress)
        .then(() => {
          const list = swaggerExpress.runner.swagger.definitions.adminrolepath.properties.path.enum;
          assert(list.length === 12);
          assert(list.includes('GET:/*'));
          assert(list.includes('POST:/*'));
          assert(list.includes('PUT:/*'));
          assert(list.includes('DELETE:/*'));
          assert(list.includes('GET:/adminuser'));
          assert(list.includes('POST:/adminuser'));
          assert(list.includes('PUT:/adminuser'));
          assert(list.includes('DELETE:/adminuser'));
          assert(list.includes('GET:/adminrole'));
          assert(list.includes('POST:/adminrole'));
          assert(list.includes('PUT:/adminrole'));
          assert(list.includes('DELETE:/adminrole'));
        })
      ;
    });

  });

});
