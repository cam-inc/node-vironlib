const assert = require('assert');
const times = require('mout/function/times');

const test = require('../');
const vironlib = test.vironlib;
const auditLog = vironlib.auditLog;

describe('audit_log/controller', () => {

  describe('list', () => {

    beforeEach(() => {
      times(110, i => {
        test.models.AuditLogs.create({
          request_method: 'GET',
          request_uri: `/test/${i}`,
          user_id: `user_${i}`,
          request_body: '{}',
          status_code: 200,
          source_ip: '127.0.0.1',
        });
      });
    });

    const list = auditLog.controller.list;
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
});
