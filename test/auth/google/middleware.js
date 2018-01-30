const assert = require('assert');
const sinon = require('sinon');

const test = require('../../');

describe('auth/google/middleware', () => {
  let helperGoogle, middlewareGoogle, stubHelperGoogle;

  before(() => {
    const vironlib = test.vironlib;
    helperGoogle = vironlib.auth.google.helper;
    middlewareGoogle = vironlib.auth.google.middleware();
  });

  beforeEach(() => {
    stubHelperGoogle = sinon.stub(helperGoogle);
  });

  afterEach(() => {
    Object.keys(stubHelperGoogle).forEach(funcName => {
      stubHelperGoogle[funcName].restore();
    });
  });

  it('トークンリフレッシュを行いメアドを取得できた場合はAuthorizationヘッダを更新する', async () => {
    stubHelperGoogle.getMailAddress.onCall(0).resolves();
    stubHelperGoogle.getMailAddress.onCall(1).resolves('test@example.com');
    stubHelperGoogle.refreshToken.resolves({
      access_token: 'new_atoken',
      refresh_token: 'new_rtoken',
    });

    await Promise.all([
      test.models.AdminUsers.create({
        email: 'test@example.com',
        role_id: 'tester',
      }),
      test.models.AdminRoles.create({
        role_id: 'tester',
        method: 'get',
        resource: 'test'
      })
    ])
      .then(() => {
        const req = test.genRequest({
          swagger: {
            operation: {
              security: {},
            },
          },
          auth: {
            googleOAuthToken: {
              access_token: 'atoken',
              refresh_token: 'rtoken',
            },
          },
        });
        const res = test.genResponse();

        return new Promise(resolve => {
          middlewareGoogle(req, res, err => {
            assert(!err);
            assert(res.get('Authorization'));
            assert(req.auth.googleOAuthToken.access_token === 'new_atoken');
            assert(req.auth.googleOAuthToken.refresh_token === 'new_rtoken');
            resolve();
          });
        });
      })
    ;
  });

  it('トークンリフレッシュを行ってもメアドを取得できない場合はUnauthorizedエラー', async () => {
    stubHelperGoogle.getMailAddress.resolves();
    stubHelperGoogle.refreshToken.resolves({
      access_token: 'new_atoken',
      refresh_token: 'new_rtoken',
    });

    const req = test.genRequest({
      swagger: {
        operation: {
          security: {},
        },
      },
      auth: {
        googleOAuthToken: {
          access_token: 'atoken',
          refresh_token: 'rtoken',
        },
      },
    });
    const res = test.genResponse();

    await new Promise(resolve => {
      middlewareGoogle(req, res, err => {
        assert(err.data.name === 'Unauthorized');
        resolve();
      });
    });
  });

  it('401以外のエラーの場合はそのままエラーを返す', async () => {
    const e = new Error();
    e.statusCode = 500;
    stubHelperGoogle.getMailAddress.rejects(e);

    const req = test.genRequest({
      swagger: {
        operation: {
          security: {},
        },
      },
      auth: {
        googleOAuthToken: {
          access_token: 'atoken',
          refresh_token: 'rtoken',
        },
      },
    });
    const res = test.genResponse();

    await new Promise(resolve => {
      middlewareGoogle(req, res, err => {
        assert(err === e);
        resolve();
      });
    });
  });

  it('google認証を利用していない場合は何もしない', async () => {
    const req = test.genRequest({
      swagger: {
        operation: {
          security: {},
        },
      },
      auth: {
      },
    });
    const res = test.genResponse();

    await new Promise(resolve => {
      middlewareGoogle(req, res, err => {
        assert(!err);
        resolve();
      });
    });
  });

  it('認証不要なリクエストの場合は何もしない', async () => {
    const req = test.genRequest();
    const res = test.genResponse();

    await new Promise(resolve => {
      middlewareGoogle(req, res, err => {
        assert(!err);
        resolve();
      });
    });
  });

});
