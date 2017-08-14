const assert = require('assert');

const test = require('./');
const dmclib = test.dmclib;
const pager = dmclib.pager;

describe('pager', () => {

  describe('setResHeader', () => {

    const setResHeader = pager.setResHeader;

    it('レスポンスヘッダにpagerの情報が付加される', () => {
      const res = test.genResponse();
      setResHeader(res, 10, 100, 311);
      assert(res.get('X-Pagination-Limit') === 10);
      assert(res.get('X-Pagination-Total-Pages') === 32);
      assert(res.get('X-Pagination-Current-Page') === 11);
    });

  });

});
