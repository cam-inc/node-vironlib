const events = require('events');

const httpMock = require('node-mocks-http');
const SequelizeMock = require('sequelize-mock');
const find = require('mout/array/find');
const get = require('mout/object/get');

const DmcLib = require('../');

const store = new SequelizeMock();

const defineModel = name => {
  const m = store.define(name);
  m.__values__ = [];
  m.create = obj => {
    m.__values__.push(new m.Instance(obj));
    return obj;
  };
  m.count = () => {
    return Promise.resolve()
      .then(() => {
        return m.__values__.length;
      })
    ;
  };
  m.$queryInterface.$useHandler((query, queryOptions) => {
    switch (query) {
      case 'findAll':
        return m.__values__;
      case 'findById':
        return find(m.__values__, {id: queryOptions.id}) || null;
      case 'findOne':
        const where = get(queryOptions, '0.where');
        if (!where) {
          return m.__values__[0] || null;
        }
        // TODO: whereにSQLの命令書かれてると動かない
        return find(m.__values__, where) || null;
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
  acl: {
    allow_origin: 'http://localhost:3000',
    allow_headers: 'Authorization, X-Pagination-Limit, X-Pagination-Total-Pages, X-Pagination-Current-Page',
    expose_headers: 'X-Pagination-Limit, X-Pagination-Total-Pages, X-Pagination-Current-Page',
  },
  admin_role: {
    admin_roles: models.AdminRoles,
    store: store,
    default_role: 'viewer',
  },
  admin_user: {
    admin_users: models.AdminUsers,
    default_role: 'viewer',
  },
  audit_log: {
    audit_logs: models.AuditLogs,
  },
  auth: {
    admin_roles: models.AdminRoles,
    admin_users: models.AdminUsers,
    super_role: 'super',
    default_role: 'viewer',
    auth_jwt: {
      algorithm: 'HS512',
      secret: 'test-secret',
      claims: {
        iss: 'dmc.test',
        aud: 'dmclib',
      },
      //rsa_private_key: 'xxxxxxxxxxxx',
      //rsa_public_key: 'xxxxxxxxxxxx',
    },
    google_oauth: {
      client_id: 'xxxxxxxxxxxxxxxxxxxx',
      client_secret: 'zzzzzzzzzzzzzzzzzzzz',
      redirect_url: 'http://localhost/redirect',
      state_url: 'http://localhost/dmc'
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
