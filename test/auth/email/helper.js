const assert = require('assert');

const test = require('../../');

describe('auth/email/helper', () => {
  let helperEMail;

  before(() => {
    const vironlib = test.vironlib;
    helperEMail = vironlib.auth.email.helper;
  });

  describe('genSalt', () => {

    it('ソルトが生成される', async () => {
      const salt = helperEMail.genSalt();
      assert(salt);
      assert(typeof salt === 'string');
    });

  });

  describe('genHash', () => {

    it('パスワードハッシュが生成される', async () => {
      const hash = await helperEMail.genHash('test', 'salt');
      assert(hash);
      assert(typeof hash === 'string');
      assert(hash.length === 1024);
    });

    it('同一のパスワード/ソルトからは同一のハッシュが生成される', async () => {
      const results = [];

      await helperEMail.genHash('test', 'salt')
        .then(hash => results.push(hash));
      await helperEMail.genHash('test', 'salt')
        .then(hash => results.push(hash));
      await helperEMail.genHash('test', 'fake')
        .then(hash => results.push(hash));
      await helperEMail.genHash('fake', 'salt')
        .then(hash => results.push(hash));

      assert(results[0] === results[1]);
      assert(results[0] !== results[2]);
      assert(results[0] !== results[3]);
    });

  });

  describe('verify', () => {
    let password, salt;

    before(async () => {
      salt = 'salt';
      password = await helperEMail.genHash('test', salt);
    });

    it('パスワード認証に成功する', async () => {
      const result = await helperEMail.verify('test', password, salt);
      assert(result === true);
    });

    it('パスワード認証に失敗する', async () => {
      const result = await helperEMail.verify('fake', password, salt);
      assert(result === false);
    });

  });

});
