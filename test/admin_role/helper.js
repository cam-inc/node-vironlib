const assert = require('assert');
const dmclib = require('../').dmclib;
const adminRole = dmclib.adminRole;

describe('admin_role/helper', () => {

  describe('canAccess', () => {

    const canAccess = adminRole.helper.canAccess;

    it('WhiteListにあるのでOK', () => {
      const result = canAccess('/ping', 'GET', {});
      assert(result === true);
    });

    it('ワイルドカードなのでOK', () => {
      const result = canAccess('/user', 'GET', {get: ['*']});
      assert(result === true);
    });

    it('roleに対象のリソースの権限があるのでOK', () => {
      const result = canAccess('/user', 'GET', {get: ['user']});
      assert(result === true);
    });

    it('roleに対象のリソースの権限がないのでNG', () => {
      const result = canAccess('/user', 'GET', {get: ['hoge']});
      assert(result === false);
    });

  });

});
