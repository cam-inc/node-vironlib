const assert = require('assert');
const test = require('../../');
const vironlib = test.vironlib;

describe('auth/jwt/middleware', () => {

  const middleware = vironlib.auth.jwt.middleware();
  const helper = vironlib.auth.jwt.helper;

  it('検証に成功する', async () => {
    await helper.sign({
      sub: 'test',
    }, {
      claims: {
        iss: 'issuer',
        aud: 'audience',
      },
      token_expire: 10000,
      secret: 'test-secret',
      algorithm: 'HS512',
    })
      .then(token => {
        const req = test.genRequest({
          method: 'GET',
          url: '/swagger.json',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const res = test.genResponse();

        return new Promise(resolve => {
          middleware(req, res, err => {
            assert(!err);
            assert(res.get('Authorization') === `Bearer ${token}`);
            resolve();
          });
        });
      })
    ;
  });

  it('検証に失敗する', async () => {
    await helper.sign({
      sub: 'test',
    }, {
      claims: {
        iss: 'issuer',
        aud: 'audience',
      },
      token_expire: 10000,
      secret: 'dummy-secret',
      algorithm: 'HS512',
    })
      .then(token => {
        const req = test.genRequest({
          method: 'GET',
          url: '/swagger.json',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const res = test.genResponse();

        return new Promise(resolve => {
          middleware(req, res, err => {
            assert(err);
            assert(err.statusCode === 401);
            resolve();
          });
        });
      })
    ;
  });

});
