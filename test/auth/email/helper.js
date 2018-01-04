const assert = require('assert');

const test = require('../../');
const vironlib = test.vironlib;

describe('auth/email/helper', () => {

  const helper = vironlib.auth.email.helper;

  describe('genSalt', () => {

    it('ソルトが生成される', async () => {
      const salt = helper.genSalt();
      assert(salt);
      assert(typeof salt === 'string');
    });

  });

  describe('genHash', () => {

    it('パスワードハッシュが生成される', async () => {
      await helper.genHash('test', 'salt')
        .then(hash => {
          assert(hash);
          assert(typeof hash === 'string');
          assert(hash.length === 1024);
        });
    });

    it('同一のパスワード/ソルトからは同一のハッシュが生成される', async () => {
      const results = [];

      await helper.genHash('test', 'salt')
        .then(hash => results.push(hash));
      await helper.genHash('test', 'salt')
        .then(hash => results.push(hash));
      await helper.genHash('test', 'fake')
        .then(hash => results.push(hash));
      await helper.genHash('fake', 'salt')
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
      password = await helper.genHash('test', salt);
    });

    it('パスワード認証に成功する', async () => {
      const result = await helper.verify('test', password, salt);
      assert(result === true);
    });

    it('パスワード認証に失敗する', async () => {
      const result = await helper.verify('fake', password, salt);
      assert(result === false);
    });

  });

});
