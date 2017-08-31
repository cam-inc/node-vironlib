const assert = require('assert');
const dmclib = require('../').dmclib;
const swagger = dmclib.swagger;
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
      await autoGenerate(swaggerExpress, test.models)
        .then(() => {
          const list = swaggerExpress.runner.swagger.definitions.adminrolepath.properties.path.enum;
          assert(list.length === 8);
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

    it('自動生成されたrole_idがUpdateAdminUserPayloadのenumにセットされる', async() => {
      await autoGenerate(swaggerExpress, test.models)
        .then(() => {
          const list = swaggerExpress.runner.swagger.definitions.UpdateAdminUserPayload.properties.role_id.enum;
          assert(list.length === 10);
          assert(list.includes('role0'));
          assert(list.includes('role1'));
          assert(list.includes('role2'));
          assert(list.includes('role3'));
          assert(list.includes('role4'));
          assert(list.includes('role5'));
          assert(list.includes('role6'));
          assert(list.includes('role7'));
          assert(list.includes('role8'));
          assert(list.includes('role9'));
        })
      ;
    });

  });

});
