const assert = require('assert');

const test = require('../');

describe('admin_role/controller', () => {
  let controllerAdminRole;

  before(() => {
    const vironlib = test.vironlib;
    controllerAdminRole = vironlib.adminRole.controller;
  });

  describe('list', () => {
    const swagger = {
      operation: {
        responses: {
          200: {
            schema: {
              items: {
                properties: {
                  role_id: {},
                  paths: {type: 'array'},
                },
              },
            },
          },
        },
      },
      swaggerObject: {},
    };

    beforeEach(async () => {
      const list = [];
      for (let i = 0; i < 110; i++) {
        for (let j = 0; j < 5; j++) {
          for (const method of ['get', 'post', 'put', 'delete']) {
            list.push({
              role_id: `role${i}`,
              method: method,
              resource: `resource${j}`,
            });
          }
        }
      }
      await test.models.AdminRoles.bulkCreate(list);
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
      controllerAdminRole.list(req, res);
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
      controllerAdminRole.list(req, res);
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
      controllerAdminRole.list(req, res);
    });

  });

  describe('create', () => {

    const swagger = {
      operation: {
        responses: {
          200: {
            schema: {
              items: {
                properties: {
                  role_id: {},
                  paths: {type: 'array'},
                },
              },
            },
          },
        },
      },
      swaggerObject: {},
    };

    beforeEach(async () => {
      await test.models.AdminRoles.create({
        role_id: 'role',
        method: 'GET',
        resource: 'resource',
      });
    });

    it('管理ロールが作成できる', done => {
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

      res.json = async result => {
        assert(result.role_id === 'tester');
        assert(result.paths.length === 4);

        const roles = await test.models.AdminRoles.findAll({where: {role_id: 'tester'}});
        assert(roles.length === 4);
        done();
      };
      controllerAdminRole.create(req, res);
    });

    it('存在するrole_idで登録しようとした際、エラーを返す', done => {
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

      controllerAdminRole.create(req, res, err => {
        assert(err.statusCode === 400);
        assert(err.data.name === 'AlreadyUsedRoleID');
        done();
      });
    });

  });

  describe('get', () => {

    const swagger = {
      operation: {
        responses: {
          200: {
            schema: {
              properties: {
                role_id: {},
                paths: {type: 'array'},
              },
            },
          },
        },
      },
      swaggerObject: {},
    };

    beforeEach(async () => {
      await test.models.AdminRoles.bulkCreate([
        {role_id: 'tester', resource: 'test', method: 'GET'},
        {role_id: 'tester', resource: 'test', method: 'POST'},
        {role_id: 'tester', resource: 'test', method: 'PUT'},
        {role_id: 'tester', resource: 'test', method: 'DELETE'},
      ]);
    });

    it('1件取得できる', done => {
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
        done();
      };
      controllerAdminRole.get(req, res);
    });

  });

  describe('remove', () => {

    const swagger = {
      operation: {
        responses: {
          200: {
            schema: {
              properties: {
                role_id: {},
                paths: {type: 'array'},
              },
            },
          },
        },
      },
      swaggerObject: {},
    };

    beforeEach(async () => {
      await test.models.AdminRoles.bulkCreate([
        {role_id: 'tester', resource: 'test', method: 'GET'},
        {role_id: 'tester', resource: 'test', method: 'POST'},
        {role_id: 'tester', resource: 'test', method: 'PUT'},
        {role_id: 'tester', resource: 'test', method: 'DELETE'},
        {role_id: 'viewer', resource: 'test', method: 'DELETE'},
      ]);
      await test.models.AdminUsers.create({
        email: 'test@example.com',
        role_id: 'viewer',
      });
    });

    it('1件削除できる', done => {
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

      res.end = async () => {
        assert(true);

        const list = await test.models.AdminRoles.findAll();
        assert(list.length === 1);
        done();
      };
      controllerAdminRole.remove(req, res);
    });

    it('削除対象の権限を持っているユーザがいる為、エラーを返す。', done => {
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

      controllerAdminRole.remove(req, res, err => {
        assert(err.statusCode === 400);
        assert(err.data.name === 'CurrentlyUsedAdminRole');
        done();
      });
    });

  });

  describe('update', () => {

    const swagger = {
      operation: {
        responses: {
          200: {
            schema: {
              properties: {
                role_id: {},
                paths: {type: 'array'},
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

    beforeEach(async () => {
      await test.models.AdminRoles.bulkCreate([
        {role_id: 'tester', resource: 'test', method: 'GET'},
        {role_id: 'tester', resource: 'test', method: 'POST'},
        {role_id: 'tester', resource: 'test', method: 'PUT'},
        {role_id: 'tester', resource: 'test', method: 'DELETE'},
      ]);
    });

    it('1件更新できる', done => {
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

      res.json = async () => {
        const result = await test.models.AdminRoles.findAll({where: {role_id: 'tester'}});
        assert(result.length === 4);
        assert(result[0].resource === 'newtest');
        assert(result[0].method === 'GET');
        assert(result[1].resource === 'newtest');
        assert(result[1].method === 'POST');
        assert(result[2].resource === 'newtest');
        assert(result[2].method === 'PUT');
        assert(result[3].resource === 'newtest');
        assert(result[3].method === 'DELETE');
        done();
      };

      controllerAdminRole.update(req, res);
    });

  });

});
