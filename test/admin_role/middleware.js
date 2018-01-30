const assert = require('assert');
const test = require('../');

describe('admin_role/middlewareAdminRole', () => {
  let middlewareAdminRole;

  before(() => {
    const vironlib = test.vironlib;
    middlewareAdminRole = vironlib.adminRole.middleware();
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
        roles: {
          get: ['adminrole'],
        },
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
        roles: {
          get: [],
        },
      },
    });
    const res = test.genResponse();

    middlewareAdminRole(req, res, err => {
      assert(err.data.name === 'Forbidden');
      done();
    });
  });
});
