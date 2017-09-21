/**
 * VironLib
 */
class VironLib {
  constructor(options) {
    this.logger = require('./logger')(options.logger);
    this.pager = require('./pager')(options.pager);

    this.acl = require('./acl')(options.acl || {});
    this.adminRole = require('./admin_role')(options.admin_role || {}, this.pager);
    this.adminUser = require('./admin_user')(options.admin_user || {}, this.pager);
    this.auditLog = require('./audit_log')(options.audit_log || {}, this.pager);
    this.auth = require('./auth')(options.auth || {});
    this.autocomplete = require('./autocomplete')(options.autocomplete || {});
    this.bodyCompletion = require('./body_completion')(options.body_completion || {});
    this.constants = require('./constants');
    this.errorHandler = require('./error_handler');
    this.errors = require('./errors');
    this.stores = require('./stores');
    this.swagger = require('./swagger')(options.swagger);
    this.swaggerValidator = require('./swagger_validator');
  }
}

module.exports = VironLib;
