const assert = require('assert');
const test = require('../../');

describe('auth/jwt/middleware', () => {
  let helperJwt, middlewareJwt;

  before(() => {
    const vironlib = test.vironlib;
    helperJwt = vironlib.auth.jwt.helper;
    middlewareJwt = vironlib.auth.jwt.middleware();
  });

  it('検証に成功する', async () => {
    const token = helperJwt.sign({
      sub: 'test',
    }, {
      claims: {
        iss: 'issuer',
        aud: 'audience',
      },
      token_expire: 10000,
      secret: 'test-secret',
      algorithm: 'HS512',
    });
    const req = test.genRequest({
      method: 'GET',
      url: '/swagger.json',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const res = test.genResponse();

    return new Promise(resolve => {
      middlewareJwt(req, res, err => {
        assert(!err);
        assert(res.get('Authorization') === `Bearer ${token}`);
        resolve();
      });
    });
  });

  it('検証に失敗する', async () => {
    const token = helperJwt.sign({
      sub: 'test',
    }, {
      claims: {
        iss: 'issuer',
        aud: 'audience',
      },
      token_expire: 10000,
      secret: 'dummy-secret',
      algorithm: 'HS512',
    });
    const req = test.genRequest({
      method: 'GET',
      url: '/swagger.json',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const res = test.genResponse();

    return new Promise(resolve => {
      middlewareJwt(req, res, err => {
        assert(err);
        assert(err.statusCode === 401);
        resolve();
      });
    });
  });

});
