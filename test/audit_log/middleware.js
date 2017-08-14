const assert = require('assert');
const test = require('../');
const dmclib = test.dmclib;
const auditLog = dmclib.auditLog;

describe('audit_log/middleware', () => {

  const middleware = auditLog.middleware();

  it('AuditLogがDBに保存される', done => {
    const req = test.genRequest({
      method: 'GET',
      url: '/swagger.json',
      connection: {
        remoteAddress: '127.0.0.1',
      }
    });
    const res = test.genResponse();

    middleware(req, res, () => {
      res.on('end', () => {
        test.models.AuditLogs.findAll()
          .then(list => {
            assert(list.length === 1);
            const data = list[0].dataValues;
            assert(data.request_method === 'GET');
            assert(data.request_uri === '/swagger.json');
            assert(data.status_code === 200);
            assert(data.source_ip === '127.0.0.1');
            assert(data.request_body === '{}');
            done();
          })
        ;
      });

      res.end({});
    });
  });

  it('/pingは保存されない', done => {
    const req = test.genRequest({
      method: 'GET',
      url: '/ping',
      connection: {
        remoteAddress: '127.0.0.1',
      }
    });
    const res = test.genResponse();

    middleware(req, res, () => {
      res.on('end', () => {
        test.models.AuditLogs.findAll()
          .then(list => {
            assert(list.length === 0);
            done();
          })
        ;
      });

      res.end({});
    });
  });

});
