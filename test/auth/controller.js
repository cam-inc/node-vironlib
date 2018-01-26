const assert = require('assert');
const url = require('url');
const qs = require('qs');

const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const test = require('../');
const vironlib = test.vironlib;

describe('auth/controller', () => {

  const controller = vironlib.auth.controller;

  describe('signIn', () => {

    const signIn = controller.signIn;
    const helperEMail = vironlib.auth.email.helper;

    it('1人目はスーパーユーザーとして登録される', done => {
      const req = test.genRequest({
        body: {
          email: 'test@viron.com',
          password: 'aaaaaaaa',
        },
      });
      const res = test.genResponse();

      res.end = async () => {
        assert(res.get('Authorization').startsWith('Bearer '));

        const m = await test.models.AdminUsers.findOne({where: {email: 'test@viron.com'}});
        assert(m.role_id === 'super');
        assert(m.password);
        assert(m.salt);
        done();
      };
      signIn(req, res);
    });

    it('存在すればログインできる', done => {
      const salt = helperEMail.genSalt();

      Promise.resolve().then(async () => {
        const hash = await helperEMail.genHash('aaaaaaaa', salt);
        await test.models.AdminUsers.create({
          email: 'test2@viron.com',
          role_id: 'viewer',
          password: hash,
          salt: salt,
        });

        const req = test.genRequest({
          body: {
            email: 'test2@viron.com',
            password: 'aaaaaaaa',
          },
        });
        const res = test.genResponse();

        res.end = () => {
          const token = res.get('Authorization').split(' ')[1];
          assert(token);
          const decoded = jwt.decode(token);
          assert(decoded);
          assert(decoded.sub === 'test2@viron.com');
          done();
        };

        signIn(req, res);
      });
    });

    it('存在しないユーザーはAdminUserNotFoundエラー', done => {
      const salt = helperEMail.genSalt();

      Promise.resolve().then(async () => {
        const hash = await helperEMail.genHash('aaaaaaaa', salt);
        await test.models.AdminUsers.create({
          email: 'super@viron.com',
          role_id: 'super',
          password: hash,
          salt: salt,
        });

        const req = test.genRequest({
          body: {
            email: 'test@viron.com',
            password: 'bbbbbbbb',
          },
        });
        const res = test.genResponse();

        res.end = () => {
          assert.fail('don\'t reach here.');
        };

        signIn(req, res, err => {
          assert(err.statusCode === 404);
          assert(err.data.name === 'AdminUserNotFound');
          done();
        });
      });
    });

    it('パスワード入力ミスはSigninFailedエラー', done => {
      const salt = helperEMail.genSalt();

      Promise.resolve().then(async () => {
        const hash = await helperEMail.genHash('aaaaaaaa', salt);
        await test.models.AdminUsers.create({
          email: 'test@viron.com',
          role_id: 'viewer',
          password: hash,
          salt: salt,
        });

        const req = test.genRequest({
          body: {
            email: 'test@viron.com',
            password: 'bbbbbbbb',
          },
        });
        const res = test.genResponse();

        res.json = err => {
          assert(err.statusCode === 400);
          assert(err.data.name === 'SigninFailed');
          done();
        };

        signIn(req, res);
      });
    });

  });

  describe('signOut', () => {

    const signOut = controller.signOut;

    it('叩ければOK', done => {
      const req = test.genRequest();
      const res = test.genResponse();

      res.end = () => {
        assert(true);
        done();
      };

      signOut(req, res);
    });

  });

  describe('googleSignIn', () => {

    const googleSignIn = controller.googleSignIn;

    it('Googleの認証URLにリダイレクトされる', done => {
      const req = test.genRequest();
      const res = test.genResponse();

      res.redirect = url => {
        assert(url);
        done();
      };

      googleSignIn(req, res);
    });

    it('redirect_urlを渡せばそのURLがstateに含まれたURLにリダイレクトされる', done => {
      const req = test.genRequest({
        query: {
          redirect_url: 'http://viron.com/test',
        },
      });
      const res = test.genResponse();

      res.redirect = redirectUrl => {
        assert(redirectUrl);
        const parsed = url.parse(redirectUrl);
        const query = qs.parse(parsed.query);
        assert(query.state === 'http://viron.com/test');
        done();
      };

      googleSignIn(req, res);
    });

  });

  describe('googleOAuth2Callback', () => {

    const googleOAuth2Callback = controller.googleOAuth2Callback;
    const helperGoogle = vironlib.auth.google.helper;

    let getTokenStub, allowMailDomainStub;

    beforeEach(() => {
      getTokenStub = sinon.stub(helperGoogle, 'getToken');
      allowMailDomainStub = sinon.stub(helperGoogle, 'allowMailDomain');
    });

    afterEach(() => {
      getTokenStub.restore();
      allowMailDomainStub.restore();
    });

    it('1人目はスーパーユーザーとして登録される', done => {
      getTokenStub.resolves('ttttooookkkkeeeennnn');
      allowMailDomainStub.resolves('test@viron.com');

      const req = test.genRequest({
        query: {
          state: 'http://localhost/redirect',
          code: 'xxxxx',
        },
      });
      const res = test.genResponse();

      res.redirect = async redirectUrl => {
        const parsed = url.parse(redirectUrl);
        assert(parsed.host === 'localhost');
        assert(parsed.pathname === '/redirect');
        const query = qs.parse(parsed.query);
        assert(query.token.startsWith('Bearer '));

        const m = await test.models.AdminUsers.findOne({where: {email: 'test@viron.com'}});
        assert(m.role_id === 'super');
        done();
      };

      googleOAuth2Callback(req, res);
    });

    it('存在すればログインできる', done => {
      getTokenStub.resolves('ttttooookkkkeeeennnn');
      allowMailDomainStub.resolves('test2@viron.com');

      Promise.resolve().then(() => {
        return test.models.AdminUsers.create({
          email: 'test2@viron.com',
          role_id: 'viewer',
        });
      }).then(() => {
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
          assert(decoded.sub === 'test2@viron.com');
          done();
        };

        googleOAuth2Callback(req, res);
      });
    });

    it('存在しないユーザーは作成される', done => {
      getTokenStub.resolves('ttttooookkkkeeeennnn');
      allowMailDomainStub.resolves('test2@viron.com');

      Promise.resolve().then(() => {
        return test.models.AdminUsers.create({
          email: 'super@viron.com',
          role_id: 'super',
        });
      }).then(() => {
        const req = test.genRequest({
          query: {
            state: 'http://localhost/redirect',
            code: 'xxxxx',
          },
        });
        const res = test.genResponse();

        res.redirect = async redirectUrl => {
          const parsed = url.parse(redirectUrl);
          const query = qs.parse(parsed.query);
          const token = query.token.split(' ')[1];
          assert(token);
          const decoded = jwt.decode(token);
          assert(decoded);
          assert(decoded.sub === 'test2@viron.com');

          const m = await test.models.AdminUsers.findOne({where: {email: 'test2@viron.com'}});
          assert(m.role_id === 'viewer');
          done();
        };

        googleOAuth2Callback(req, res);
      });
    });

    it('許可されていないメールアドレスはログインできない', done => {
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
        done();
      };

      googleOAuth2Callback(req, res);
    });

  });

});
