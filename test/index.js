const http = require('http');
const SequelizeMock = require('sequelize-mock');

const DmcLib = require('../');

const store = new SequelizeMock();

const AdminUsers = store.define('admin_users', {
  // write mock data
});
const AdminRoles = store.define('admin_roles', {
  // write mock data
});
const AuditLogs = store.define('audit_logs', {
  // write mock data
});

const genRequest = swagger => {
  const req = new http.IncomingMessage();
  req.swagger = swagger;
  req.get = key => {
    return req.headers[key.toLowerCase()];
  };
  return req;
};

const genResponse = () => {
  const res = new http.OutgoingMessage();
  res.status = code => {
    res.statusCode = code;
    return res;
  };
  res.set = res.header = (k, v) => {
    res.headers = res.headers || {};
    res.headers[k.toLowerCase()] = v;
  };
  return res;
};

const options = {
  admin_role: {
    AdminRoles: AdminRoles,
    store: store,
    default_role: 'viewer',
  },
  admin_user: {
    AdminUsers: AdminUsers,
    default_role: 'viewer',
  },
  audit_log: {
    AuditLogs: AuditLogs,
  },
  auth: {
    AdminRoles: AdminRoles,
    AdminUsers: AdminUsers,
    super_role: 'super',
    auth_jwt: {
      algorithm: 'RS512',
      rsa_private_key: 'xxxxxxxxxxxx',
      rsa_public_key: 'xxxxxxxxxxxx',
    },
  },
};

module.exports = {
  dmclib: new DmcLib(options),
  genRequest,
  genResponse,
};
