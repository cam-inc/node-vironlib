const assert = require('assert');
const url = require('url');
const qs = require('qs');

const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const test = require('../');
const dmclib = test.dmclib;

describe('auth/controller', () => {

  const controller = dmclib.auth.controller;

  describe('signIn', () => {

    const signIn = controller.signIn;
    const helperEMail = dmclib.auth.email.helper;

    it('1人目はスーパーユーザーとして登録される', async() => {
      const req = test.genRequest({
        body: {
          email: 'test@dmc.com',
          password: 'aaaaaaaa',
        },
      });
      const res = test.genResponse();

      res.end = () => {
        assert(res.get('Authorization').startsWith('Bearer '));

        test.models.AdminUsers.findOne({where: {email: 'test@dmc.com'}})
          .then(m => {
            assert(m.role_id === 'super');
            assert(m.password);
            assert(m.salt);
          })
        ;
      };
      await signIn(req, res);
    });

    it('存在すればログインできる', async() => {
      const salt = helperEMail.genSalt();
      await helperEMail.genHash('aaaaaaaa', salt)
        .then(hash => {
          return test.models.AdminUsers.create({
            email: 'test2@dmc.com',
            role_id: 'viewer',
            password: hash,
            salt: salt,
          });
        })
        .then(() => {
          const req = test.genRequest({
            body: {
              email: 'test2@dmc.com',
              password: 'aaaaaaaa',
            },
          });
          const res = test.genResponse();

          res.end = () => {
            const token = res.get('Authorization').split(' ')[1];
            assert(token);
            const decoded = jwt.decode(token);
            assert(decoded);
            assert(decoded.sub === 'test2@dmc.com');
          };

          return signIn(req, res);
        })
      ;
    });

    it('存在しないユーザーはAdminUserNotFoundエラー', async() => {
      const salt = helperEMail.genSalt();
      await helperEMail.genHash('aaaaaaaa', salt)
        .then(hash => {
          return test.models.AdminUsers.create({
            email: 'super@dmc.com',
            role_id: 'super',
            password: hash,
            salt: salt,
          });
        })
        .then(() => {
          const req = test.genRequest({
            body: {
              email: 'test@dmc.com',
              password: 'bbbbbbbb',
            },
          });
          const res = test.genResponse();

          res.end = () => {
            assert.fail('don\'t reach here.');
          };

          return signIn(req, res)
            .catch(err => {
              assert(err.statusCode === 404);
              assert(err.data.name === 'AdminUserNotFound');
            })
          ;
        })
      ;
    });

    it('パスワード入力ミスはSigninFailedエラー', async() => {
      const salt = helperEMail.genSalt();
      await helperEMail.genHash('aaaaaaaa', salt)
        .then(hash => {
          return test.models.AdminUsers.create({
            email: 'test@dmc.com',
            role_id: 'viewer',
            password: hash,
            salt: salt,
          });
        })
        .then(() => {
          const req = test.genRequest({
            body: {
              email: 'test@dmc.com',
              password: 'bbbbbbbb',
            },
          });
          const res = test.genResponse();

          res.end = () => {
            assert.fail('don\'t reach here.');
          };

          return signIn(req, res)
            .catch(err => {
              assert(err.statusCode === 400);
              assert(err.data.name === 'SigninFailed');
            })
          ;
        })
      ;
    });

  });

  describe('signOut', () => {

    const signOut = controller.signOut;

    it('叩ければOK', async() => {
      const req = test.genRequest();
      const res = test.genResponse();

      res.end = () => {
        assert(true);
      };

      await signOut(req, res);
    });

  });

  describe('googleSignIn', () => {

    const googleSignIn = controller.googleSignIn;

    it('Googleの認証URLにリダイレクトされる', async() => {
      const req = test.genRequest();
      const res = test.genResponse();

      res.redirect = url => {
        assert(url);
      };

      await googleSignIn(req, res);
    });

  });

  describe('googleOAuth2Callback', () => {

    const googleOAuth2Callback = controller.googleOAuth2Callback;
    const helperGoogle = dmclib.auth.google.helper;

    let getTokenStub, allowMailDomainStub;

    beforeEach(() => {
      getTokenStub = sinon.stub(helperGoogle, 'getToken');
      allowMailDomainStub = sinon.stub(helperGoogle, 'allowMailDomain');
    });

    afterEach(() => {
      getTokenStub.restore();
      allowMailDomainStub.restore();
    });

    it('1人目はスーパーユーザーとして登録される', async() => {
      getTokenStub.resolves('ttttooookkkkeeeennnn');
      allowMailDomainStub.resolves('test@dmc.com');

      const req = test.genRequest({
        query: {
          state: 'http://localhost/redirect',
          code: 'xxxxx',
        },
      });
      const res = test.genResponse();

      res.redirect = redirectUrl => {
        const parsed = url.parse(redirectUrl);
        assert(parsed.host === 'localhost');
        assert(parsed.pathname === '/redirect');
        const query = qs.parse(parsed.query);
        assert(query.token.startsWith('Bearer '));

        return test.models.AdminUsers.findOne({where: {email: 'test@dmc.com'}})
          .then(m => {
            assert(m.role_id === 'super');
          })
        ;
      };

      await googleOAuth2Callback(req, res);
    });

    it('存在すればログインできる', async() => {
      getTokenStub.resolves('ttttooookkkkeeeennnn');
      allowMailDomainStub.resolves('test2@dmc.com');
      test.models.AdminUsers.create({
        email: 'test2@dmc.com',
        role_id: 'viewer',
      });

      const req = test.genRequest({
        query: {
          state: 'http://localhost/redirect',
          code: 'xxxxx',
        },
      });
      const res = test.genResponse();

      res.redirect = redirectUrl => {
        const parsed = url.parse(redirectUrl);
        const query = qs.parse(parsed.query);
        const token = query.token.split(' ')[1];
        assert(token);
        const decoded = jwt.decode(token);
        assert(decoded);
        assert(decoded.sub === 'test2@dmc.com');
      };

      await googleOAuth2Callback(req, res);
    });

    it('存在しないユーザーは作成される', async() => {
      getTokenStub.resolves('ttttooookkkkeeeennnn');
      allowMailDomainStub.resolves('test2@dmc.com');
      test.models.AdminUsers.create({
        email: 'super@dmc.com',
        role_id: 'super',
      });

      const req = test.genRequest({
        query: {
          state: 'http://localhost/redirect',
          code: 'xxxxx',
        },
      });
      const res = test.genResponse();

      res.redirect = redirectUrl => {
        const parsed = url.parse(redirectUrl);
        const query = qs.parse(parsed.query);
        const token = query.token.split(' ')[1];
        assert(token);
        const decoded = jwt.decode(token);
        assert(decoded);
        assert(decoded.sub === 'test2@dmc.com');

        return test.models.AdminUsers.findOne({where: {email: 'test2@dmc.com'}})
          .then(m => {
            assert(m.role_id === 'viewer');
          })
        ;
      };

      await googleOAuth2Callback(req, res);
    });

    it('許可されていないメールアドレスはログインできない', async() => {
      getTokenStub.resolves('ttttooookkkkeeeennnn');
      allowMailDomainStub.resolves(false);

      const req = test.genRequest({
        query: {
          state: 'http://localhost/redirect',
          code: 'xxxxx',
        },
      });
      const res = test.genResponse();

      res.redirect = redirectUrl => {
        const parsed = url.parse(redirectUrl);
        const query = qs.parse(parsed.query);
        assert(!query.token);
      };

      await googleOAuth2Callback(req, res);
    });

  });

});
