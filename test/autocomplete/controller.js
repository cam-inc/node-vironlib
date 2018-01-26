const assert = require('assert');

const test = require('../');
const autocomplete = test.vironlib.autocomplete;

describe('autocomplete/controller', () => {

  describe('list', () => {

    beforeEach(async () => {
      for (let i = 0; i < 101; i++) {
        await test.models.AdminUsers.create({
          email: `test${i}@example.com`,
          role_id: 'viewer',
        });
      }
    });

    const list = autocomplete.controller.list;

    it('emailで部分一致検索した結果が取得できる', done => {
      const req = test.genRequest({
        query: {
          model: 'admin_users',
          value: 'id',
          email: 'test1',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        // 1, 10〜19, 100
        assert(result.length === 12);
        assert(result[0].value !== result[0].name);
        assert(result[0].name === 'test1@example.com');
        assert(result[1].name === 'test10@example.com');
        done();
      };
      list(req, res);
    });

    it('model未指定時は空配列', done => {
      const req = test.genRequest({
        query: {
          email: '0@example.com',
          value: 'id',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 0);
        done();
      };
      list(req, res);
    });

    it('modelに一致するテーブルがない場合は空配列', done => {
      const req = test.genRequest({
        query: {
          model: '__dummy__',
          email: '0@example.com',
          value: 'id',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 0);
        done();
      };
      list(req, res);
    });

  });

});
