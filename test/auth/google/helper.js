const assert = require('assert');
const url = require('url');
const qs = require('qs');

const axios = require('axios');
const gapi = require('googleapis');
const sinon = require('sinon');

const test = require('../../');
const dmclib = test.dmclib;

describe('auth/google/helper', () => {

  const helper = dmclib.auth.google.helper;

  describe('getClient', () => {

    it('OAuth2クライアントを取得できる', () => {
      const result = helper.getClient({
        client_id: 'xxxxxxxxxxxxxxxxxxxx',
        client_secret: 'zzzzzzzzzzzzzzzzzzzz',
        redirect_url: 'http://localhost/redirect'
      });
      assert(result);
    });

  });

  describe('getAuthUrl', () => {

    it('認証ページのURLを取得できる', () => {
      const result = helper.genAuthUrl({
        client_id: 'xxxxxxxxxxxxxxxxxxxx',
        client_secret: 'zzzzzzzzzzzzzzzzzzzz',
        redirect_url: 'http://localhost/redirect',
        state_url: 'http://localhost/dmc'
      });
      const parsed = url.parse(result);
      assert(parsed.host === 'accounts.google.com');
      const query = qs.parse(parsed.query);
      assert(query.scope === 'https://www.googleapis.com/auth/userinfo.email');
      assert(query.state === 'http://localhost/dmc');
      assert(query.response_type === 'code');
      assert(query.client_id === 'xxxxxxxxxxxxxxxxxxxx');
      assert(query.redirect_uri === 'http://localhost/redirect');
    });

  });

  describe('getToken', () => {
    let stubOAuthClient;

    beforeEach(() => {
      stubOAuthClient = sinon.stub(gapi.auth, 'OAuth2');
      stubOAuthClient.returns({
        getToken: (code, callback) => {
          callback(null, {access_token: `token:${code}`});
        },
      });
    });

    afterEach(() => {
      stubOAuthClient.restore();
    });

    it('アクセストークンを取得できる', async() => {
      await helper.getToken('ccccooooddddeeee', {})
        .then(token => {
          assert(token === 'token:ccccooooddddeeee');
        })
      ;
    });
  });

  describe('getMailAddress', () => {
    let stubGet;

    beforeEach(() => {
      stubGet = sinon.stub(axios, 'get');
      stubGet.resolves({data: {email: 'test@dmc.com'}});
    });

    afterEach(() => {
      stubGet.restore();
    });

    it('メールアドレスを取得できる', async() => {
      await helper.getMailAddress('xxxxx')
        .then(email => {
          assert(email === 'test@dmc.com');

          assert(stubGet.calledWith('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: 'OAuth xxxxx',
            },
          }));
        })
      ;
    });
  });

  describe('allowMainDomain', () => {
    let stubGet;

    beforeEach(() => {
      stubGet = sinon.stub(axios, 'get');
      stubGet.resolves({data: {email: 'test@dmc.com'}});
    });

    afterEach(() => {
      stubGet.restore();
    });

    it('許可されているドメインの場合はメールアドレスが取得できる', async() => {
      await helper.allowMailDomain('xxxxx', {
        allow_email_domains: ['dmc.com'],
      })
        .then(email => {
          assert(email === 'test@dmc.com');
        })
      ;
    });

    it('許可されていないドメインの場合はfalse', async() => {
      await helper.allowMailDomain('xxxxx', {
        allow_email_domains: ['dummy.com'],
      })
        .then(email => {
          assert(email === false);
        })
      ;
    });
  });

});
