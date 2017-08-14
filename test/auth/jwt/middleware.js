const assert = require('assert');
const test = require('../../');
const dmclib = test.dmclib;

describe('auth/jwt/middleware', () => {

  const middleware = dmclib.auth.jwt.middleware();
  const helper = dmclib.auth.jwt.helper;

  it('検証に成功する', async() => {
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
            resolve();
          });
        });
      })
    ;
  });

  it('検証に失敗する', async() => {
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
