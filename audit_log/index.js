const controller = require('./controller');
const middleware = require('./middleware');

module.exports = options => {
  if (!options.AuditLogs) {
    return console.warn('[DMCLIB] audit_log options.AuditLogs required.');
  }

  return {
    controller: controller(options),
    middleware: () => middleware(options),
  };
};
