/**
 * DmcLib
 */
class DmcLib {
  constructor(options) {
    this.pager = require('./pager')(options.pager);

    this.acl = require('./acl')(options.acl || {});
    this.adminRole = require('./admin_role')(options.admin_role || {}, this.pager);
    this.adminUser = require('./admin_user')(options.admin_user || {}, this.pager);
    this.auditLog = require('./audit_log')(options.audit_log || {}, this.pager);
    this.auth = require('./auth')(options.auth || {});
    this.constants = require('./constants');
    this.errorHandler = require('./error_handler');
    this.errors = require('./errors');
    this.stores = require('./stores');
    this.swagger = require('./swagger')();
  }
}

module.exports = DmcLib;
