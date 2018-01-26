const assert = require('assert');

const test = require('../');
const vironlib = test.vironlib;
const adminUser = vironlib.adminUser;

describe('admin_user/controller', () => {

  const swagger = {
    operation: {
      responses: {
        200: {
          schema: {
            items: {
              properties: {
                id: {},
                email: {},
                role_id: {},
              },
            },
          },
        },
      },
    },
  };

  describe('list', () => {

    beforeEach(async () => {
      for (let i = 0; i < 110; i++) {
        await test.models.AdminUsers.create({
          email: `test${i}@viron.com`,
          role_id: 'viewer',
        });
      }
    });

    const list = adminUser.controller.list;

    it('1ページ目が取得できる', done => {
      const req = test.genRequest({swagger});
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 50);

        assert(res.get('X-Pagination-Limit') === 50);
        assert(res.get('X-Pagination-Total-Pages') === 3);
        assert(res.get('X-Pagination-Current-Page') === 1);
        done();
      };
      list(req, res);
    });

    it('2ページ目が取得できる', done => {
      const req = test.genRequest({
        swagger,
        query: {
          offset: 50,
          limit: 50,
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 50);

        assert(res.get('X-Pagination-Limit') === 50);
        assert(res.get('X-Pagination-Total-Pages') === 3);
        assert(res.get('X-Pagination-Current-Page') === 2);
        done();
      };
      list(req, res);
    });

    it('最終ページが取得できる', done => {
      const req = test.genRequest({
        swagger,
        query: {
          offset: 100,
          limit: 50,
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 10);

        assert(res.get('X-Pagination-Limit') === 50);
        assert(res.get('X-Pagination-Total-Pages') === 3);
        assert(res.get('X-Pagination-Current-Page') === 3);
        done();
      };
      list(req, res);
    });

  });

  describe('create', () => {

    const create = adminUser.controller.create;

    it('管理ユーザーが作成できる', done => {
      const req = test.genRequest({
        swagger,
        body: {
          email: 'test@viron.com',
          password: 'aaaaaaaa',
        },
      });
      const res = test.genResponse();

      res.json = async result => {
        assert(result.email === 'test@viron.com');
        assert(result.role_id === 'viewer');

        const m = await test.models.AdminUsers.findOne({where: {email: 'test@viron.com'}});
        assert(m.role_id === 'viewer');
        assert(m.password);
        assert(m.salt);
        done();
      };
      create(req, res);
    });

  });

  describe('get', () => {

    const get = adminUser.controller.get;
    let data;

    beforeEach(async () => {
      data = await test.models.AdminUsers.create({
        email: 'test@viron.com',
        role_id: 'viewer',
      });
    });

    it('1件取得できる', done => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            id: {
              value: data.id,
            },
          },
        }, swagger),
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.email === 'test@viron.com');
        assert(result.role_id === 'viewer');
        done();
      };
      get(req, res);
    });

  });

  describe('remove', () => {

    const remove = adminUser.controller.remove;
    let data;

    beforeEach(async () => {
      data = await test.models.AdminUsers.create({
        email: 'test@viron.com',
        role_id: 'viewer',
      });
    });

    it('1件削除できる', done => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            id: {
              value: data.id,
            },
          },
        }, swagger),
      });
      const res = test.genResponse();

      res.end = async () => {
        assert(true);

        const m = await test.models.AdminUsers.findOne({where: {email: 'test@viron.com'}});
        assert(!m);
        done();
      };

      remove(req, res);
    });

  });

  describe('update', () => {

    const update = adminUser.controller.update;
    let data;

    beforeEach(async () => {
      data = await test.models.AdminUsers.create({
        email: 'test@viron.com',
        role_id: 'viewer',
        password: 'aaaaaaaaaaaaaaaa',
      });
    });

    it('1件更新できる', done => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            id: {
              value: data.id,
            },
          },
        }, swagger),
        body: {
          password: 'bbbbbbbbbbbbbbbbbbb',
          role_id: 'tester',
        },
      });
      const res = test.genResponse();

      res.json = async () => {
        const m = await test.models.AdminUsers.findOne({where: {email: 'test@viron.com'}});
        assert(m.role_id === 'tester');
        assert(m.password !== 'aaaaaaaaaaaaaaaa');
        done();
      };

      update(req, res);
    });

    it('パスワードがnullだった場合、パスワードを更新しない', done => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            id: {
              value: data.id,
            },
          },
        }, swagger),
        body: {
          password: null,
          role_id: 'tester',
        },
      });
      const res = test.genResponse();

      res.json = async () => {
        const m = await test.models.AdminUsers.findOne({where: {email: 'test@viron.com'}});
        assert(m.role_id === 'viewer');
        assert(m.password === 'aaaaaaaaaaaaaaaa');
        done();
      };

      update(req, res);
    });

  });

});
