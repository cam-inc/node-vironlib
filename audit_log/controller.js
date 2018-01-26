const asyncWrapper = require('../async_wrapper');

/**
 * Controller : List Audit Log
 * HTTP Method : GET
 * PATH : /auditlog
 *
 * @param {Object} options
 * @param {Sequelize.model} options.audit_logs
 * @param {Object} pager
 * @returns {function(*, *, *)}
 */
const registerList = (options, pager) => {
  const AuditLogs = options.audit_logs;

  return asyncWrapper(async (req, res) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    const limit = Number(req.query.limit || pager.defaultLimit);
    const offset = Number(req.query.offset || 0);
    const where = {};

    if (req.query.user_id) {
      where.user_id = {$like: `${req.query.user_id}%`};
    }
    if (req.query.request_method) {
      where.request_method = req.query.request_method;
    }
    if (req.query.request_uri) {
      where.request_uri = {$like: `${req.query.request_uri}%`};
    }
    const options = {
      attributes,
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    };
    const result = await AuditLogs.findAndCountAll(options);
    pager.setResHeader(res, limit, offset, result.count);
    return res.json(result.rows);
  });
};

module.exports = (options, pager) => {
  return {
    list: registerList(options, pager),
  };
};
