const logger = require('../logger');
const controller = require('./controller');

module.exports = (options, pager) => {
  if (!options.admin_users) {
    return logger.warn('[VIRONLIB] admin_user options.admin_users required.');
  }
  if (!options.default_role) {
    return logger.warn('[VIRONLIB] admin_user options.default_role required.');
  }

  return {
    controller: controller(options, pager),
  };
};
