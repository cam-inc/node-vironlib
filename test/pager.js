const assert = require('assert');

const test = require('./');

describe('pager', () => {
  let pager;

  before(() => {
    const vironlib = test.vironlib;
    pager = vironlib.pager;
  });

  describe('setResHeader', () => {

    it('レスポンスヘッダにpagerの情報が付加される', () => {
      const res = test.genResponse();
      pager.setResHeader(res, 10, 100, 311);
      assert(res.get('X-Pagination-Limit') === 10);
      assert(res.get('X-Pagination-Total-Pages') === 32);
      assert(res.get('X-Pagination-Current-Page') === 11);
    });

    it('limitを渡さなければオプションの値が適用される', () => {
      const res = test.genResponse();
      pager.setResHeader(res, null, 100, 311);
      assert(res.get('X-Pagination-Limit') === 50);
      assert(res.get('X-Pagination-Total-Pages') === 7);
      assert(res.get('X-Pagination-Current-Page') === 3);
    });

  });

});
