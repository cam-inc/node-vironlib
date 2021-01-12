const assert = require('assert');

const test = require('../');
const {AUTH_TYPE_EMAIL} = require('../../constants');

describe('admin_user/controller', () => {
  let controllerAdminUser;

  before(() => {
    const vironlib = test.vironlib;
    controllerAdminUser = vironlib.adminUser.controller;
  });

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
      const list = [];
      for (let i = 0; i < 110; i++) {
        list.push({
          email: `test${i}@example.com`,
          role_id: 'viewer',
        });
      }
      await test.models.AdminUsers.bulkCreate(list);
    });

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
      controllerAdminUser.list(req, res);
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
      controllerAdminUser.list(req, res);
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
      controllerAdminUser.list(req, res);
    });

  });

  describe('create', () => {

    it('管理ユーザーが作成できる', done => {
      const req = test.genRequest({
        swagger,
        body: {
          email: 'test@example.com',
          password: 'aaaaaaaa',
        },
      });
      const res = test.genResponse();

      res.json = async result => {
        assert(result.email === 'test@example.com');
        assert(result.role_id === 'viewer');

        const m = await test.models.AdminUsers.findOne({where: {email: 'test@example.com'}});
        assert(m.role_id === 'viewer');
        assert(m.password);
        assert(m.salt);
        done();
      };
      controllerAdminUser.create(req, res);
    });

  });

  describe('get', () => {

    let data;

    beforeEach(async () => {
      data = await test.models.AdminUsers.create({
        email: 'test@example.com',
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
        assert(result.email === 'test@example.com');
        assert(result.role_id === 'viewer');
        done();
      };
      controllerAdminUser.get(req, res);
    });

  });

  describe('remove', () => {

    let data;

    beforeEach(async () => {
      data = await test.models.AdminUsers.create({
        email: 'test@example.com',
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

        const m = await test.models.AdminUsers.findOne({where: {email: 'test@example.com'}});
        assert(!m);
        done();
      };

      controllerAdminUser.remove(req, res);
    });

  });

  describe('update', () => {

    let data;

    beforeEach(async () => {
      data = await test.models.AdminUsers.create({
        email: 'test@example.com',
        role_id: 'viewer',
        password: 'aaaaaaaaaaaaaaaa',
        auth_type: AUTH_TYPE_EMAIL
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
          auth_type: AUTH_TYPE_EMAIL
        },
      });
      const res = test.genResponse();

      res.json = async () => {
        const m = await test.models.AdminUsers.findOne({where: {email: 'test@example.com'}});
        assert(m.role_id === 'tester');
        assert(m.password !== 'aaaaaaaaaaaaaaaa');
        done();
      };

      controllerAdminUser.update(req, res);
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
        },
      });
      const res = test.genResponse();

      res.json = async () => {
        const m = await test.models.AdminUsers.findOne({where: {email: 'test@example.com'}});
        assert(m.role_id === 'viewer');
        assert(m.password === 'aaaaaaaaaaaaaaaa');
        done();
      };

      controllerAdminUser.update(req, res);
    });

    it('ロールIDのみ更新できる', done => {
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
          auth_type: AUTH_TYPE_EMAIL
        },
      });
      const res = test.genResponse();

      res.json = async () => {
        const m = await test.models.AdminUsers.findOne({where: {email: 'test@example.com'}});
        assert(m.role_id === 'tester');
        assert(m.password === 'aaaaaaaaaaaaaaaa');
        done();
      };

      controllerAdminUser.update(req, res);
    });

  });

});
