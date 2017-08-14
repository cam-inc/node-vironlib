const events = require('events');

const httpMock = require('node-mocks-http');
const SequelizeMock = require('sequelize-mock');

const DmcLib = require('../');

const store = new SequelizeMock();

const defineModel = name => {
  const m = store.define(name);

  m.create = obj => {
    m.__values__.push(new m.Instance(obj));
    return obj;
  };
  m.$queryInterface.$useHandler((query, queryOptions) => {
    switch (query) {
      case 'findAll':
        return m.__values__;
      case 'findById':
        console.log('findById', query, JSON.stringify(queryOptions));
        //return m.__values__[queryOptions.id];
        return;
      //case 'update':
      //case 'destroy':
      default:
        return;
    }
  });

  return m;
};

const models = {
  AdminUsers: defineModel('admin_users'),
  AdminRoles: defineModel('admin_roles'),
  AuditLogs: defineModel('audit_logs'),
};

const genRequest = options => {
  const req = httpMock.createRequest(options);
  return req;
};

const genResponse = () => {
  const res = httpMock.createResponse({
    eventEmitter: events.EventEmitter,
  });
  return res;
};

const options = {
  admin_role: {
    AdminRoles: models.AdminRoles,
    store: store,
    default_role: 'viewer',
  },
  admin_user: {
    AdminUsers: models.AdminUsers,
    default_role: 'viewer',
  },
  audit_log: {
    AuditLogs: models.AuditLogs,
  },
  auth: {
    AdminRoles: models.AdminRoles,
    AdminUsers: models.AdminUsers,
    super_role: 'super',
    auth_jwt: {
      algorithm: 'RS512',
      rsa_private_key: 'xxxxxxxxxxxx',
      rsa_public_key: 'xxxxxxxxxxxx',
    },
  },
  pager: {
    limit: 50,
  },
};

beforeEach(() => {
  // mockdataをクリア
  for (let k in models) {
    const m = models[k];
    m.__values__ = [];
  }
});

module.exports = {
  dmclib: new DmcLib(options),
  genRequest,
  genResponse,
  models,
};
