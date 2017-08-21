const assert = require('assert');
const test = require('../');
const dmclib = test.dmclib;
const adminRole = dmclib.adminRole;

describe('admin_role/middleware', () => {

  const middleware = adminRole.middleware();

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

    middleware(req, res, err => {
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

    middleware(req, res, err => {
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

    middleware(req, res, err => {
      assert(err.data.name === 'Forbidden');
      done();
    });
  });
});
