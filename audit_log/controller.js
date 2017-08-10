const pager = require('../pager');

/**
 * Controller : List Audit Log
 * HTTP Method : GET
 * PATH : /auditlog
 *
 * @param {Object} options
 * @param {Sequelize.model} options.AuditLogs
 * @returns {function()}
 */
const registerList = options => {
  const AuditLogs = options.AuditLogs;

  return () => {
    return (req, res) => {
      const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
      const limit = req.query.limit;
      const offset = req.query.offset;
      return Promise.resolve()
        .then(() => {
          return AuditLogs.count();
        })
        .then(count => {
          pager.setResHeader(res, limit, offset, count);
          const options = {
            attributes,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
          };
          return AuditLogs.findAll(options);
        })
        .then(list => {
          res.json(list);
        })
      ;
    };
  };
};

module.exports = options => {
  return {
    registerList: registerList(options),
  };
};
