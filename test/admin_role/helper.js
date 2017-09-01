const assert = require('assert');
const test = require('../');
const adminRole = test.vironlib.adminRole;

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

  describe('getRoles', () => {

    const getRoles = adminRole.helper.getRoles;

    beforeEach(() => {
      ['get', 'post', 'put', 'delete'].forEach(method => {
        test.models.AdminRoles.create({
          role_id: 'tester',
          method: method,
          resource: 'test',
        });
      });
    });

    it('スーパー権限の場合はすべてワイルドカード', async() => {
      await getRoles(test.models.AdminRoles, 'super', 'super')
        .then(roles => {
          assert(roles.get[0] === '*');
          assert(roles.post[0] === '*');
          assert(roles.put[0] === '*');
          assert(roles.delete[0] === '*');
          assert(roles.patch[0] === '*');
        })
      ;
    });

    it('所持している権限のみ取得できる', async() => {
      await getRoles(test.models.AdminRoles, 'tester', 'super')
        .then(roles => {
          assert(roles.get.length === 1);
          assert(roles.post.length === 1);
          assert(roles.put.length === 1);
          assert(roles.delete.length === 1);
          assert(!roles.patch);

          assert(roles.get[0] === 'test');
          assert(roles.post[0] === 'test');
          assert(roles.put[0] === 'test');
          assert(roles.delete[0] === 'test');
        })
      ;
    });

  });

});
