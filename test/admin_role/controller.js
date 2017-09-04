const assert = require('assert');
const times = require('mout/function/times');

const test = require('../');
const vironlib = test.vironlib;
const adminRole = vironlib.adminRole;

describe('admin_role/controller', () => {

  const swagger = {
    operation: {
      responses: {
        200: {
          schema: {
            items: {
              properties: {
                role_id: {},
                paths: {},
              },
            },
          },
        },
      },
    },
    swaggerObject: {
      definitions: {
        UpdateAdminUserPayload: {
          properties: {
            role_id: {
              enum: ['tester'],
            },
          },
        },
      },
    },
  };

  describe('list', () => {

    beforeEach(() => {
      times(110, i => {
        times(5, j => {
          ['get', 'post', 'put', 'delete'].forEach(method => {
            test.models.AdminRoles.create({
              role_id: `role${i}`,
              method: method,
              resource: `resource${j}`,
            });
          });
        });
      });
    });

    const list = adminRole.controller.list;

    it('1ページ目が取得できる', async() => {
      const req = test.genRequest({swagger});
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 50);

        assert(res.get('X-Pagination-Limit') === 50);
        assert(res.get('X-Pagination-Total-Pages') === 3);
        assert(res.get('X-Pagination-Current-Page') === 1);
      };
      await list(req, res);
    });

    it('2ページ目が取得できる', async() => {
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
      };
      await list(req, res);
    });

    it('最終ページが取得できる', async() => {
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
      };
      await list(req, res);
    });

  });

  describe('create', () => {

    beforeEach(() => {
      test.models.AdminRoles.create({
        role_id: 'role',
        method: 'GET',
        resource: 'resource',
      });
    });

    const create = adminRole.controller.create;

    it('管理ロールが作成できる', async() => {
      const req = test.genRequest({
        swagger,
        body: {
          role_id: 'tester',
          paths: [
            {allow: true, path: 'GET:/test'},
            {allow: true, path: 'POST:/test'},
            {allow: true, path: 'PUT:/test'},
            {allow: true, path: 'DELETE:/test'},
          ]
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.role_id === 'tester');
        assert(result.paths.length === 4);

        return test.models.AdminRoles.findAll({where: {role_id: 'tester'}})
          .then(roles => {
            assert(req.swagger.swaggerObject.definitions.UpdateAdminUserPayload.properties.role_id.enum.length === 2);
            assert(roles.length === 4);
          })
        ;
      };
      await create(req, res);
    });

    it('存在するrole_idで登録しようとした際、エラーを返す', async() => {
      const req = test.genRequest({
        swagger,
        body: {
          role_id: 'role',
          paths: [
            {allow: true, path: 'GET:/test'},
            {allow: true, path: 'POST:/test'},
            {allow: true, path: 'PUT:/test'},
            {allow: true, path: 'DELETE:/test'},
          ]
        },
      });
      const res = test.genResponse();

      await create(req, res, err => {
        assert(err.statusCode === 400);
        assert(err.data.name === 'CurrentlyUsedAdminRole');
      });
    });

  });

  describe('get', () => {

    const get = adminRole.controller.get;

    beforeEach(() => {
      test.models.AdminRoles.bulkCreate([
        {role_id: 'tester', resource: 'test', method: 'GET'},
        {role_id: 'tester', resource: 'test', method: 'POST'},
        {role_id: 'tester', resource: 'test', method: 'PUT'},
        {role_id: 'tester', resource: 'test', method: 'DELETE'},
      ]);
    });

    it('1件取得できる', async() => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            role_id: {
              value: 'tester',
            },
          },
        }, swagger),
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.role_id === 'tester');
        assert(result.paths.length === 4);
        assert(result.paths[0].allow === true);
        assert(result.paths[0].path === 'GET:/test');
        assert(result.paths[1].allow === true);
        assert(result.paths[1].path === 'POST:/test');
        assert(result.paths[2].allow === true);
        assert(result.paths[2].path === 'PUT:/test');
        assert(result.paths[3].allow === true);
        assert(result.paths[3].path === 'DELETE:/test');
      };
      await get(req, res);
    });

  });

  describe('remove', () => {

    const remove = adminRole.controller.remove;

    beforeEach(() => {
      test.models.AdminRoles.bulkCreate([
        {role_id: 'tester', resource: 'test', method: 'GET'},
        {role_id: 'tester', resource: 'test', method: 'POST'},
        {role_id: 'tester', resource: 'test', method: 'PUT'},
        {role_id: 'tester', resource: 'test', method: 'DELETE'},
        {role_id: 'viewer', resource: 'test', method: 'DELETE'},
      ]);
      test.models.AdminUsers.create({
        email: 'test@dmc.com',
        role_id: 'viewer',
      });
    });

    it('1件削除できる', async() => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            role_id: {
              value: 'tester',
            },
          },
        }, swagger),
      });
      const res = test.genResponse();

      res.end = () => {
        assert(true);

        return test.models.AdminRoles.findAll()
          .then(list => {
            assert(req.swagger.swaggerObject.definitions.UpdateAdminUserPayload.properties.role_id.enum.length === 1);
            assert(list.length === 1);
          })
        ;
      };
      await remove(req, res);
    });

    it('削除対象の権限を持っているユーザがいる為、エラーを返す。', async() => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            role_id: {
              value: 'viewer',
            },
          },
        }, swagger),
      });
      const res = test.genResponse();

      await remove(req, res, err => {
        assert(err.statusCode === 400);
        assert(err.data.name === 'CurrentlyUsedAdminRole');
      });
    });

  });

  describe('update', () => {

    const update = adminRole.controller.update;

    beforeEach(() => {
      test.models.AdminRoles.bulkCreate([
        {role_id: 'tester', resource: 'test', method: 'GET'},
        {role_id: 'tester', resource: 'test', method: 'POST'},
        {role_id: 'tester', resource: 'test', method: 'PUT'},
        {role_id: 'tester', resource: 'test', method: 'DELETE'},
      ]);
    });

    it('1件更新できる', async() => {
      const req = test.genRequest({
        swagger: Object.assign({
          params: {
            role_id: {
              value: 'tester',
            },
          },
        }, swagger),
        body: {
          role_id: 'tester',
          paths: [
            {allow: true, path: 'GET:/newtest'},
            {allow: true, path: 'POST:/newtest'},
            {allow: true, path: 'PUT:/newtest'},
            {allow: true, path: 'DELETE:/newtest'},
          ]
        },
      });
      const res = test.genResponse();

      res.json = () => {
        return test.models.AdminRoles.findAll({where: {role_id: 'tester'}})
          .then(result => {
            assert(result.length === 4);
            assert(result[0].resource === 'newtest');
            assert(result[0].method === 'GET');
            assert(result[1].resource === 'newtest');
            assert(result[1].method === 'POST');
            assert(result[2].resource === 'newtest');
            assert(result[2].method === 'PUT');
            assert(result[3].resource === 'newtest');
            assert(result[3].method === 'DELETE');
          })
        ;
      };
      await update(req, res);
    });

  });

});
