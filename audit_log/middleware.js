const unless = require('express-unless');

const getSourceIp = req => {
  return (req.get('x-forwarded-for') || '').split(',')[0] ||
    req.connection.remoteAddress;
};

/**
 * Middleware : Write Audit Log
 *
 * @param {Object} options
 * @param {Sequelize.model} options.audit_logs
 * @returns {function(*, *, *)}
 */
module.exports = options => {
  const AuditLogs = options.audit_logs;

  // 監査ログ出力を除外するリクエスト
  const unlessOptions = options.unless || {};
  unlessOptions.path = unlessOptions.path || [];
  unlessOptions.path.push({
    url: '/ping',
    methods: ['GET'],
  });
  unlessOptions.method = unlessOptions.method || [];
  unlessOptions.method.push('OPTIONS');

  const log = (req, res, next) => {
    const originalEnd = res.end;
    res.end = (data, encoding) => {
      res.end = originalEnd;

      const log = {
        request_method: req.method,
        request_uri: req.path,
        user_id: req.auth ? req.auth.sub : '',
        request_body: JSON.stringify(req.body || {}),
        status_code: res.statusCode,
        source_ip: getSourceIp(req),
      };
      AuditLogs.create(log);

      res.end(data, encoding);
    };

    next();
  };

  log.unless = unless;

  return (req, res, next) => {
    log.unless(unlessOptions)(req, res, next);
  };
};
