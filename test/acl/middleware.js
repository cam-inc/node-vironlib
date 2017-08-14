const assert = require('assert');
const test = require('../');
const dmclib = test.dmclib;
const acl = dmclib.acl;

describe('acl/middleware', () => {

  const middleware = acl.middleware();

  it('レスポンスヘッダにACLの情報が付加される', done => {
    const req = test.genRequest();
    const res = test.genResponse();

    middleware(req, res, () => {
      assert(res.get('Access-Control-Allow-Origin') === 'http://localhost:3000');
      assert(res.get('Access-Control-Allow-Credentials') === true);
      assert(res.get('Access-Control-Allow-Methods') === 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
      assert(res.get('Access-Control-Allow-Headers') === 'Authorization, X-Pagination-Limit, X-Pagination-Total-Pages, X-Pagination-Current-Page');
      assert(res.get('Access-Control-Expose-Headers') === 'X-Pagination-Limit, X-Pagination-Total-Pages, X-Pagination-Current-Page');
      done();
    });
  });

});
