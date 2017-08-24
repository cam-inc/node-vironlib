const events = require('events');

const httpMock = require('node-mocks-http');
const SequelizeMock = require('sequelize-mock');
const find = require('mout/array/find');
const filter = require('mout/array/filter');
const get = require('mout/object/get');
const deepClone = require('mout/lang/deepClone');
const deepMatches = require('mout/object/deepMatches');
const pick = require('mout/object/pick');
const reject = require('mout/array/reject');
const sort = require('mout/array/sort');

const DmcLib = require('../');

const store = new SequelizeMock();

store.transaction = fn => {
  if (!fn) {
    fn = t => Promise.resolve(t);
  }
  return new Promise((resolve, reject) => {
    const t = {
      commit: () => { return Promise.resolve(); },
      rollback: () => { return Promise.resolve(); },
    };
    return fn(t).then(resolve, reject);
  });
};

const defineModel = name => {
  const m = store.define(name);
  m.__values__ = [];
  m.create = obj => {
    const instance = new m.Instance(obj);
    m.__values__.push(instance);
    return instance;
  };
  m.count = () => {
    return Promise.resolve()
      .then(() => {
        return m.__values__.length;
      })
    ;
  };
  m.$queryInterface.$useHandler((query, queryOptions) => {
    let options, attributes, where, limit, offset, order, force;
    switch (query) {
      case 'findAll':
        options = queryOptions[0] || {};
        attributes = options.attributes;
        order = options.order;
        limit = options.limit;
        offset = options.offset || 0;
        where = options.where;

        let values = deepClone(m.__values__);
        if (order) {
          order.forEach(ord => {
            const field = ord[0];
            const reverse = !!(ord[1] === 'DESC');
            values = sort(values, (a, b) => {
              if (reverse) {
                return a[field] - b[field];
              } else {
                return b[field] - a[field];
              }
            });
          });
        }
        if (where) {
          // TODO: whereにSQLの命令書かれてると動かない
          values = filter(values, where);
        }
        if (limit) {
          values = values.slice(offset, offset + limit);
        }
        if (attributes) {
          values = values.map(value => {
            return pick(value, attributes);
          });
        }
        return values;
      case 'findById':
        options = queryOptions[1] || {};
        attributes = options.attributes;
        const result = find(m.__values__, {id: queryOptions[0]});
        if (!result) {
          return null;
        }
        return attributes ? pick(result, attributes) : result;
      case 'findOne':
        where = get(queryOptions, '0.where');
        if (!where) {
          return m.__values__[0] || null;
        }
        // TODO: whereにSQLの命令書かれてると動かない
        return find(m.__values__, where) || null;
      case 'update':
        const data = queryOptions[0];
        options = queryOptions[1] || {};
        where = options.where;
        if (!where) {
          m.__values__ = m.__values__.map(value => {
            return new m.Instance(Object.assign(value.dataValues, data));
          });
          return [m.__values__.length];
        } else {
          let cnt = 0;
          m.__values__ = m.__values__.map(value => {
            if (deepMatches(value, where)) {
              cnt++;
              return new m.Instance(Object.assign(value.dataValues, data));
            } else {
              return value;
            }
          });
          return [cnt];
        }
      case 'destroy':
        options = queryOptions[0] || {};
        where = options.where;
        force = options.force;
        if (!where) {
          if (force) {
            m.__values__ = [];
          } else {
            m.__values__.forEach(value => {
              value.deletedAt = new Date();
            });
          }
        } else {
          if (force) {
            m.__values__ = reject(m.__values__, value => {
              return deepMatches(value, where);
            });
          } else {
            m.__values__.forEach(value => {
              if (deepMatches(value, where)) {
                value.deletedAt = new Date();
              }
            });
          }
        }
        return;
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
  swagger: {
    host: 'localhost:3000',
  },
  body_completion: {
    exclude_paths: ['/ping'],
  }
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
