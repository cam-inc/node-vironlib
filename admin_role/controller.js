const reduce = require('mout/object/reduce');

const logger = require('../logger');
const errors = require('../errors');

const genAdminRole = (roleId, paths) => {
  return reduce(paths, (ret, obj) => {
    if (!obj.allow) {
      return ret;
    }
    const p = obj.path.split(':/');
    ret.push({
      role_id: roleId,
      method: p[0].trim().toUpperCase(),
      resource: p[1].trim(),
    });
    return ret;
  }, []);
};

/**
 * Controller : List Admin Role
 * HTTP Method : GET
 * PATH : /adminrole
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_roles
 * @param {Object} pager
 * @returns {function(*, *, *)}
 */
const registerList = (options, pager) => {
  const AdminRoles = options.admin_roles;

  return (req, res, next) => {
    const limit = Number(req.query.limit || pager.defaultLimit);
    const offset = Number(req.query.offset || 0);

    return AdminRoles.findAll()
      .then(list => {
        const data = reduce(reduce(list, (ret, role) => {
          ret[role.role_id] = ret[role.role_id] || [];
          ret[role.role_id].push({allow: true, path: `${role.method}:/${role.resource}`});
          return ret;
        }, {}), (ret, paths, roleId) => {
          ret.push({paths: paths, role_id: roleId});
          return ret;
        }, []);

        const count = data.length;
        const _data = data.slice(offset, offset + limit);
        pager.setResHeader(res, limit, offset, count);

        return res.json(_data);
      })
      .catch(next)
    ;
  };
};

/**
 * Controller : Create Admin Role
 * HTTP Method : POST
 * PATH : /adminrole
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_roles
 * @param {Sequelize} options.store
 * @returns {function(*, *, *)}
 */
const registerCreate = options => {
  const AdminRoles = options.admin_roles;

  return (req, res, next) => {
    const roleId = req.body.role_id;
    const paths = req.body.paths;
    const list = genAdminRole(roleId, paths);
    return AdminRoles.findAll({where: {role_id: roleId}})
      .then(data => {
        if (data.length !== 0) {
          return next(errors.frontend.CurrentlyUsedAdminRole());
        }
        return AdminRoles.bulkCreate(list);
      })
      .then(() => {
        // 一覧取得
        return AdminRoles.findAll();
      })
      .then(list => {
        // swagger書き換え
        const enums = new Set();
        list.forEach(role => {
          enums.add(role.dataValues.role_id);
        });
        const def = req.swagger.swaggerObject.definitions.UpdateAdminUserPayload;
        def.properties.role_id.enum = Array.from(enums);
        return res.json({role_id: roleId, paths: paths});
      })
      .catch(next)
    ;
  };
};

/**
 * Controller : Get Admin Role
 * HTTP Method : GET
 * PATH : /adminrole/:role_id
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_roles
 * @returns {function(*, *, *)}
 */
const registerGet = options => {
  const AdminRoles = options.admin_roles;

  return (req, res, next) => {
    const roleId = req.swagger.params.role_id.value;
    return AdminRoles.findAll({where: {role_id: roleId}})
      .then(list => {
        const paths = list.map(role => {
          return {allow: true, path: `${role.method}:/${role.resource}`};
        });
        return res.json({paths: paths, role_id: roleId});
      })
      .catch(next)
    ;
  };
};

/**
 * Controller : Remove Admin Role
 * HTTP Method : DELETE
 * PATH : /adminrole/:role_id
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_roles
 * @param {Sequelize.model} options.admin_users
 * @returns {function(*, *, *)}
 */
const registerRemove = options => {
  const AdminRoles = options.admin_roles;
  const AdminUsers = options.admin_users;
  return (req, res, next) => {
    const roleId = req.swagger.params.role_id.value;
    return AdminUsers.findAll({where: {role_id: roleId}})
      .then(list => {
        // 削除対象の権限を持っているユーザがいたら、エラーを返す。
        if (list.length !== 0) {
          return next(errors.frontend.CurrentlyUsedAdminRole());
        }
        return AdminRoles.destroy({where: {role_id: roleId}, force: true});
      })
      .then(() => {
        // 一覧取得
        return AdminRoles.findAll();
      })
      .then(list => {
        // swagger書き換え
        const enums = new Set();
        list.forEach(role => {
          enums.add(role.dataValues.role_id);
        });
        const def = req.swagger.swaggerObject.definitions.UpdateAdminUserPayload;
        def.properties.role_id.enum = Array.from(enums);
        return res.status(204).end();
      })
      .catch(next)
    ;
  };
};

/**
 * Controller : Update Admin Role
 * HTTP Method : PUT
 * PATH : /adminrole/:role_id
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_roles
 * @param {Sequelize} options.store
 * @returns {function(*, *, *)}
 */
const registerUpdate = options => {
  const AdminRoles = options.admin_roles;
  const store = options.store;

  return (req, res, next) => {
    const roleId = req.swagger.params.role_id.value;
    const paths = req.body.paths;
    const list = genAdminRole(roleId, paths);

    return Promise.resolve()
      .then(() => {
        return store.transaction();
      })
      .then(t => {
        return AdminRoles.destroy({where: {role_id: roleId}, force: true, transaction: t})
          .then(() => {
            return AdminRoles.bulkCreate(list, {transaction: t});
          })
          .then(() => {
            return t.commit();
          })
          .catch(err => {
            logger.error(err);
            return t.rollback();
          })
        ;
      })
      .then(() => {
        return res.json({role_id: roleId, paths: paths});
      })
      .catch(next)
    ;
  };
};

module.exports = (options, pager, adminUserOption) => {
  return {
    list: registerList(options, pager),
    create: registerCreate(options),
    get: registerGet(options),
    remove: registerRemove(options, adminUserOption),
    update: registerUpdate(options),
  };
};
