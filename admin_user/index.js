const controller = require('./controller');

module.exports = (options, pager) => {
  if (!options.AdminUsers) {
    return console.warn('[DMCLIB] admin_user options.AdminUsers required.');
  }
  if (!options.default_role) {
    return console.warn('[DMCLIB] admin_user options.default_role required.');
  }

  return {
    controller: controller(options, pager),
  };
};
