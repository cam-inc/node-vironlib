const assert = require('assert');
const times = require('mout/function/times');

const test = require('../');
const autocomplete = test.vironlib.autocomplete;

describe('autocomplete/controller', () => {

  describe('list', () => {

    beforeEach(() => {
      times(101, i => {
        test.models.AdminUsers.create({
          email: `test${i}@viron.com`,
          role_id: 'viewer',
        });
      });
    });

    const list = autocomplete.controller.list;

    it('emailで部分一致検索した結果が取得できる', async() => {
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
        assert(result[0].name === 'test1@viron.com');
        assert(result[1].name === 'test10@viron.com');
      };
      await list(req, res);
    });

    it('model未指定時は空配列', async() => {
      const req = test.genRequest({
        query: {
          email: '0@viron.com',
          value: 'id',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 0);
      };
      await list(req, res);
    });

    it('modelに一致するテーブルがない場合は空配列', async() => {
      const req = test.genRequest({
        query: {
          model: '__dummy__',
          email: '0@viron.com',
          value: 'id',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 0);
      };
      await list(req, res);
    });

  });

});
