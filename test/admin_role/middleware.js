const assert = require('assert');
const test = require('../');

describe('admin_role/middleware', () => {
  let middlewareAdminRole;

  before(() => {
    const vironlib = test.vironlib;
    middlewareAdminRole = vironlib.adminRole.middleware();
  });

  beforeEach(async () => {
    await test.models.AdminUsers.bulkCreate([
      {
        id: 111111111111,
        email: 'test1@example.com',
        role_id: 'super'
      },
      {
        id: 111111111112,
        email: 'test2@example.com',
        role_id: 'viewer'
      }
    ]);
  });

  it('認証不要なリクエストなのでOK', done => {
    const swagger = {
      operation: {
        security: null,
      },
    };
    const req = test.genRequest({
      swagger,
      method: 'GET',
      url: '/ping'
    });
    const res = test.genResponse();

    middlewareAdminRole(req, res, err => {
      assert(!err);
      done();
    });
  });

  it('権限があるのでOK', done => {
    const swagger = {
      operation: {
        security: {
          jwt: ['api:access'],
        },
      },
    };
    const req = test.genRequest({
      swagger,
      method: 'GET',
      url: '/adminrole',
      auth: {
        sub: 'test1@example.com'
      },
    });
    const res = test.genResponse();

    middlewareAdminRole(req, res, err => {
      assert(!err);
      done();
    });
  });

  it('権限がないのでNG', done => {
    const swagger = {
      operation: {
        security: {
          jwt: ['api:access'],
        },
      },
    };
    const req = test.genRequest({
      swagger,
      method: 'GET',
      url: '/adminrole',
      auth: {
        sub: 'test2@example.com'
      },
    });
    const res = test.genResponse();

    middlewareAdminRole(req, res, err => {
      assert(err.data.name === 'Forbidden');
      done();
    });
  });
});
