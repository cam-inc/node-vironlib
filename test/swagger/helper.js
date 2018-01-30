const assert = require('assert');
const test = require('../');

describe('swagger/helper', () => {
  let helperSwagger;

  before(() => {
    const vironlib = test.vironlib;
    helperSwagger = vironlib.swagger.helper;
  });

  describe('getPort', () => {

    it('swaggerに記述されたhostからportを取得できる', () => {
      const swaggerExpress = {
        runner: {
          swagger: {
            host: 'localhost:3000',
          },
        },
      };

      const result = helperSwagger.getPort(swaggerExpress, 8080);
      assert(result === 3000);
    });

    it('デフォルト値が取得できる', () => {
      const swaggerExpress = {
        runner: {
          swagger: {
          },
        },
      };

      const result = helperSwagger.getPort(swaggerExpress, 8080);
      assert(result === 8080);
    });
  });

  describe('autoGenerate', () => {

    beforeEach(async () => {
      const list = [];
      for (let i = 0; i < 10; i++) {
        list.push({
          role_id: `role${i}`,
          method: 'GET'
        });
      }
      await test.models.AdminRoles.bulkCreate(list);
    });

    const swaggerExpress = {
      runner: {
        swagger: {
          definitions: {
            adminrolepath: {
              properties: {
                path: {
                  enum: [],
                },
                allow: {type: 'boolean'},
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

    it('自動生成されたパスがadminrolepathのenumにセットされる', async () => {
      await helperSwagger.autoGenerate(swaggerExpress)
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

    it('swaggerオブジェクトを直接渡すこともできる', async () => {
      await helperSwagger.autoGenerate(swaggerExpress.runner.swagger)
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
