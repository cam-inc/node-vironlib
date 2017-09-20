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
          email: 'test1',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        // 1, 10〜19, 100
        assert(result.length === 12);
        // disp未指定時、nameはvalueと一致する
        assert(result[0].value === result[0].name);
      };
      await list(req, res);
    });

    it('dispを指定した場合はnameとして取得できる', async() => {
      const req = test.genRequest({
        query: {
          model: 'admin_users',
          email: '0@viron.com',
          disp: 'id',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        // 0, 10, 20, 30,,,
        assert(result.length === 11);
        assert(result[0].value === 'test0@viron.com');
        // disp指定時、nameはdispに指定したフィールドの値になる
        assert(result[0].name !== result[0].value);
      };
      await list(req, res);
    });

    it('model未指定時は空配列', async() => {
      const req = test.genRequest({
        query: {
          email: '0@viron.com',
          disp: 'id',
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
          disp: 'id',
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
