const get = require('mout/object/get');
const errors = require('../errors');
const constants = require('../constants');
const {isMongoDB} = require('../helper');
const helper = require('./helper');

/**
 * Middleware : Check Admin Role
 *
 * @returns {function(*, *, *)}
 */
module.exports = options => {
  const AdminRoles = options.admin_roles;
  const AdminUsers = options.admin_users;
  const superRole = options.super_role || constants.VIRON_SUPER_ROLE;

  return async (req, res, next) => {
    if (!get(req, 'swagger.operation.security')) {
      // 認証不要なリクエスト
      return next();
    }

    const adminUser = isMongoDB(AdminUsers) ?
      await AdminUsers.findOne({
        email: get(req, 'auth.sub')
      }) :
      await AdminUsers.findOne({
        where: {
          email: get(req, 'auth.sub')
        }
      });
    if (!adminUser) {
      return next(errors.frontend.Forbidden());
    }
    const roles = await helper.getRoles(AdminRoles, adminUser.role_id, superRole);
    if (!helper.canAccess(req.path, req.method, roles)) {
      return next(errors.frontend.Forbidden());
    }
    req.auth.roles = roles;
    next();
  };
};
