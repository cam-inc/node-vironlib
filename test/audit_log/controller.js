const assert = require('assert');

const test = require('../');

describe('audit_log/controller', () => {
  let controllerAuditLog;

  before(() => {
    const vironlib = test.vironlib;
    controllerAuditLog = vironlib.auditLog.controller;
  });

  describe('list', () => {

    beforeEach(async () => {
      for (let i = 0; i < 110; i++) {
        await test.models.AuditLogs.create({
          request_method: 'GET',
          request_uri: `/test/${i}`,
          user_id: `user_${i}`,
          request_body: '{}',
          status_code: 200,
          source_ip: '127.0.0.1',
        });
      }
    });

    const swagger = {
      operation: {
        responses: {
          200: {
            schema: {
              items: {
                properties: {
                  createdAt: {},
                  request_body: {},
                  request_method: {},
                  request_uri: {},
                  source_ip: {},
                  status_code: {},
                  user_id: {},
                },
              },
            },
          },
        },
      },
    };

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
      controllerAuditLog.list(req, res);
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
      controllerAuditLog.list(req, res);
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
      controllerAuditLog.list(req, res);
    });

    it('user_id,response_method,response_uriで検索できる', done => {
      const req = test.genRequest({
        swagger,
        query: {
          user_id: 'user_107',
          request_method: 'GET',
          request_uri: '/test/1'
        },
      });
      const res = test.genResponse();

      res.json = result => {
        assert(result.length === 1);
        assert(result[0].user_id === 'user_107');
        done();
      };
      controllerAuditLog.list(req, res);
    });

  });
});
