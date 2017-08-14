const controller = require('./controller');
const helper = require('./helper');
const middleware = require('./middleware');

/**
 * AdminRole init
 * @param {Object} options
 * @param {Sequelize.Model} options.AdminRoles
 * @param {string} options.default_role
 */
const init = options => {
  const AdminRoles = options.AdminRoles;
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

      const m = {
        role_id: defaultRole,
        method: 'GET',
        resource: '*',
      };
      return AdminRoles.create(m);
    })
  ;
};

module.exports = (options, pager) => {
  if (!options.AdminRoles) {
    return console.warn('[DMCLIB] admin_role options.AdminRoles required.');
  }
  if (!options.store) {
    return console.warn('[DMCLIB] admin_role options.store required.');
  }
  if (!options.default_role) {
    return console.warn('[DMCLIB] admin_role options.default_role required.');
  }

  init(options);

  return {
    controller: controller(options, pager),
    helper: helper,
    middleware: () => middleware(options),
  };
};
