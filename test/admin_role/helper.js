const assert = require('assert');
const test = require('../');

describe('admin_role/helper', () => {
  let helperAdminRole;

  before(() => {
    const vironlib = test.vironlib;
    helperAdminRole = vironlib.adminRole.helper;
  });

  describe('canAccess', () => {

    it('WhiteListにあるのでOK', () => {
      const result = helperAdminRole.canAccess('/ping', 'GET', {});
      assert(result === true);
    });

    it('ワイルドカードなのでOK', () => {
      const result = helperAdminRole.canAccess('/user', 'GET', {get: ['*']});
      assert(result === true);
    });

    it('roleに対象のリソースの権限があるのでOK', () => {
      const result = helperAdminRole.canAccess('/user', 'GET', {get: ['user']});
      assert(result === true);
    });

    it('roleに対象のリソースの権限がないのでNG', () => {
      const result = helperAdminRole.canAccess('/user', 'GET', {get: ['hoge']});
      assert(result === false);
    });

  });

  describe('getRoles', () => {

    beforeEach(async () => {
      const list = ['get', 'post', 'put', 'delete'].map(method => {
        return {
          role_id: 'tester',
          method: method,
          resource: 'test',
        };
      });
      await test.models.AdminRoles.bulkCreate(list);
    });

    it('スーパー権限の場合はすべてワイルドカード', async () => {
      await helperAdminRole.getRoles(test.models.AdminRoles, 'super', 'super')
        .then(roles => {
          assert(roles.get[0] === '*');
          assert(roles.post[0] === '*');
          assert(roles.put[0] === '*');
          assert(roles.delete[0] === '*');
          assert(roles.patch[0] === '*');
        })
      ;
    });

    it('所持している権限のみ取得できる', async () => {
      await helperAdminRole.getRoles(test.models.AdminRoles, 'tester', 'super')
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
