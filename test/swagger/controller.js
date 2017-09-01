const assert = require('assert');
const test = require('../');
const vironlib = test.vironlib;
const swagger = vironlib.swagger;

describe('swagger/controller', () => {

  describe('show', () => {

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

      res.rson = result => {
        assert(result.host === 'localhost:3000');
      };
      await show(req, res);
    });

  });
});
