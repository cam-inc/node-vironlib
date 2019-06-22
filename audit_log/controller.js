const asyncWrapper = require('../async_wrapper');
const {isMongoDB} = require('../helper');

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

    if (isMongoDB(AuditLogs)) { // MongoDB
      const conditions = {};

      if (req.query.user_id) {
        conditions.user_id = new RegExp(`^${req.query.user_id}`);
      }
      if (req.query.request_method) {
        conditions.request_method = req.query.request_method;
      }
      if (req.query.request_uri) {
        conditions.request_uri = new RegExp(`^${req.query.request_uri}`);
      }
      const options = {
        limit,
        offset,
        sort: {
          createdAt: 'desc'
        },
      };
      const projection = {
        _id: 0,
      };
      attributes.forEach(k => {
        projection[k] = 1;
      });

      const results = await AuditLogs.find(conditions, projection, options);
      const total = await AuditLogs.countDocuments(conditions);
      pager.setResHeader(res, limit, offset, total);
      const json = [];
      results.forEach(k => {
        json.push(k.toJSON());
      });

      return res.json(json);

    } else { // MySQL
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

    }

  });
};

module.exports = (options, pager) => {
  return {
    list: registerList(options, pager),
  };
};
