const controller = require('./controller');
const helper = require('./helper');
const middleware = require('./middleware');
const logger = require('../logger');

/**
 * AdminRole init
 * @param {Object} options
 * @param {Sequelize.Model} options.admin_roles
 * @param {string} options.default_role
 */
const init = options => {
  const AdminRoles = options.admin_roles;
  const defaultRole = options.default_role;

  return Promise.resolve()
    .then(() => {
      return AdminRoles.count({where: {role_id: defaultRole}});
    })
    .then(count => {
      if (count >= 1) {
        // あれば何もしない
        return;
      }

      const tasks = [
        // 全参照権限
        AdminRoles.create({
          role_id: defaultRole,
          method: 'GET',
          resource: '*',
        }),
        // 自分のアカウント情報を更新するための権限
        AdminRoles.create({
          role_id: defaultRole,
          method: 'PUT',
          resource: 'account',
        }),
      ];

      return Promise.all(tasks);
    })
  ;
};

module.exports = (options, pager) => {
  if (!options.admin_roles) {
    return logger.warn('[VIRONLIB] admin_role options.admin_roles required.');
  }
  if (!options.store) {
    return logger.warn('[VIRONLIB] admin_role options.store required.');
  }
  if (!options.default_role) {
    return logger.warn('[VIRONLIB] admin_role options.default_role required.');
  }
  if (!options.admin_users) {
    return logger.warn('[VIRONLIB] admin_role options.admin_users required.');
  }

  init(options);

  return {
    controller: controller(options, pager),
    helper: helper,
    middleware: () => middleware(options),
  };
};
