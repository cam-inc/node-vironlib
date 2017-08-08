const assert = require('assert');
const dmclib = require('../').dmclib;
const swagger = dmclib.swagger;

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

    const autoGenerate = swagger.helper.autoGenerate;

    it('自動生成されたパスがadminrolepathのenumにセットされる', () => {
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

      autoGenerate(swaggerExpress);
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
    });

  });

});
