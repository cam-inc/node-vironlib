const assert = require('assert');

const test = require('../');
const vironlib = test.vironlib;
const account = vironlib.account;

describe('account/controller', () => {

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

    beforeEach(() => {
      test.models.AdminUsers.create({
        email: 'test@viron.com',
        role_id: 'viewer',
      });
    });

    const list = account.controller.list;

    it('1件取得できる', async () => {
      const req = test.genRequest({
        swagger,
        auth: {
          sub: 'test@viron.com',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 1);
        assert(result[0].email === 'test@viron.com');
        assert(result[0].role_id === 'viewer');
      };
      await list(req, res);
    });

  });

  describe('get', () => {

    const get = account.controller.get;
    let data;

    beforeEach(() => {
      data = test.models.AdminUsers.create({
        email: 'test@viron.com',
        role_id: 'viewer',
      });
    });

    it('1件取得できる', async () => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            id: {
              value: data.id,
            },
          },
        }, swagger),
        auth: {
          sub: 'test@viron.com',
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.email === 'test@viron.com');
        assert(result.role_id === 'viewer');
      };
      await get(req, res);
    });

  });

  describe('update', () => {

    const update = account.controller.update;
    let data;

    beforeEach(() => {
      data = test.models.AdminUsers.create({
        email: 'test@viron.com',
        role_id: 'viewer',
        password: 'aaaaaaaaaaaaaaaa',
      });
    });

    it('1件更新できる', async () => {
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
        },
        auth: {
          sub: 'test@viron.com',
        },
      });
      const res = test.genResponse();

      res.json = () => {
        return test.models.AdminUsers.findOne({where: {email: 'test@viron.com'}})
          .then(m => {
            assert(m.password !== 'aaaaaaaaaaaaaaaa');
          })
        ;
      };
      await update(req, res);
    });

  });

});
