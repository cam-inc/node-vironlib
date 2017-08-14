const controller = require('./controller');
const middleware = require('./middleware');

module.exports = (options, pager) => {
  if (!options.audit_logs) {
    return console.warn('[DMCLIB] audit_log options.audit_logs required.');
  }

  return {
    controller: controller(options, pager),
    middleware: () => middleware(options),
  };
};
