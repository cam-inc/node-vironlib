const assert = require('assert');
const test = require('../');
const dmclib = test.dmclib;
const swagger = dmclib.swagger;

describe('swagger/controller', () => {

  describe('registerShow', () => {

    const show = swagger.controller.registerShow();

    it('swagger.jsonが取得できる', () => {
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
      const req = test.genRequest(swagger);
      const res = test.genResponse();

      res.json = result => {
        assert(result.paths['/adminuser'].get);
        assert(result.paths['/adminuser'].post);
        assert(result.paths['/adminrole'].post);
      };
      show(req, res);
    });

    it('権限のないパスはswagger.jsonから削除される', () => {
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
        },
      };
      const req = test.genRequest(swagger);
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
      };
      show(req, res);
    });

  });
});
