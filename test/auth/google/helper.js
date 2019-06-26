const assert = require('assert');
const url = require('url');
const qs = require('qs');

const axios = require('axios');
const {google} = require('googleapis');
const sinon = require('sinon');

const test = require('../../');

describe('auth/google/helper', () => {
  let helperGoogle;

  before(() => {
    const vironlib = test.vironlib;
    helperGoogle = vironlib.auth.google.helper;
  });

  describe('getClient', () => {

    it('OAuth2クライアントを取得できる', () => {
      const result = helperGoogle.getClient({
        client_id: 'xxxxxxxxxxxxxxxxxxxx',
        client_secret: 'zzzzzzzzzzzzzzzzzzzz',
        redirect_url: 'http://localhost/redirect'
      });
      assert(result);
    });

  });

  describe('getAuthUrl', () => {

    it('認証ページのURLを取得できる', () => {
      const result = helperGoogle.genAuthUrl({
        client_id: 'xxxxxxxxxxxxxxxxxxxx',
        client_secret: 'zzzzzzzzzzzzzzzzzzzz',
        redirect_url: 'http://localhost/redirect',
      }, 'http://localhost/viron');
      const parsed = url.parse(result);
      assert(parsed.host === 'accounts.google.com');
      const query = qs.parse(parsed.query);
      assert(query.scope === 'https://www.googleapis.com/auth/userinfo.email');
      assert(query.state === 'http://localhost/viron');
      assert(query.response_type === 'code');
      assert(query.client_id === 'xxxxxxxxxxxxxxxxxxxx');
      assert(query.redirect_uri === 'http://localhost/redirect');
      assert(query.prompt === 'consent');
    });

  });

  describe('getToken', () => {
    let stubOAuthClient;

    beforeEach(() => {
      stubOAuthClient = sinon.stub(google.auth, 'OAuth2');
      stubOAuthClient.returns({
        getToken: (code, callback) => {
          callback(null, {access_token: `token:${code}`});
        },
      });
    });

    afterEach(() => {
      stubOAuthClient.restore();
    });

    it('アクセストークンを取得できる', async () => {
      const token = await helperGoogle.getToken('ccccooooddddeeee', {});
      assert(token.access_token === 'token:ccccooooddddeeee');
    });
  });

  describe('getMailAddress', () => {
    let stubGet;

    beforeEach(() => {
      stubGet = sinon.stub(axios, 'get');
      stubGet.resolves({data: {email: 'test@example.com'}});
    });

    afterEach(() => {
      stubGet.restore();
    });

    it('メールアドレスを取得できる', async () => {
      const email = await helperGoogle.getMailAddress({access_token: 'xxxxx'});
      assert(email === 'test@example.com');

      assert(stubGet.calledWith('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: 'OAuth xxxxx',
        },
      }));
    });
  });

  describe('allowMainDomain', () => {
    let stubGet;

    beforeEach(() => {
      stubGet = sinon.stub(axios, 'get');
      stubGet.resolves({data: {email: 'test@example.com'}});
    });

    afterEach(() => {
      stubGet.restore();
    });

    it('許可されているドメインの場合はメールアドレスが取得できる', async () => {
      const email = await helperGoogle.allowMailDomain({access_token: 'xxxxx'}, {
        allow_email_domains: ['example.com'],
      });
      assert(email === 'test@example.com');
    });

    it('許可されていないドメインの場合はfalse', async () => {
      const email = await helperGoogle.allowMailDomain({access_token: 'xxxxx'}, {
        allow_email_domains: ['dummy.com'],
      });
      assert(email === false);
    });
  });

});
