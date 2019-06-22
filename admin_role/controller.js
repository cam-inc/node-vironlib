const reduce = require('mout/object/reduce');

const asyncWrapper = require('../async_wrapper');
const {isMongoDB} = require('../helper');
const logger = require('../logger');
const errors = require('../errors');

const genAdminRole = (roleId, paths) => {
  return reduce(paths, (ret, obj, k) => {
    if (!obj.path) {
      obj = {
        path: k,
        allow: obj,
      };
    }
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

  return asyncWrapper(async (req, res) => {
    const limit = Number(req.query.limit || pager.defaultLimit);
    const offset = Number(req.query.offset || 0);

    let list;
    if (isMongoDB(AdminRoles)) { // MongoDB
      list = await AdminRoles.find();
    } else { //MySQL
      list = await AdminRoles.findAll();
    }

    const data = reduce(reduce(list, (ret, role) => {
      if (req.swagger.operation.responses[200].schema.items.properties.paths.type === 'array') {
        // paths: [{"allow":true, "path":"GET:/users"}] パターン
        ret[role.role_id] = ret[role.role_id] || [];
        ret[role.role_id].push({allow: true, path: `${role.method}:/${role.resource}`});
      } else {
        // paths: {"GET:/users": true} パターン
        ret[role.role_id] = ret[role.role_id] || {};
        ret[role.role_id][`${role.method}:/${role.resource}`] = true;
      }
      return ret;
    }, {}), (ret, paths, roleId) => {
      ret.push({paths: paths, role_id: roleId});
      return ret;
    }, []);

    const count = data.length;
    const _data = data.slice(offset, offset + limit);
    pager.setResHeader(res, limit, offset, count);

    return res.json(_data);
  });
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

  return asyncWrapper(async (req, res) => {
    const roleId = req.body.role_id;
    const paths = req.body.paths;
    const list = genAdminRole(roleId, paths);

    let data;
    if (isMongoDB(AdminRoles)) { // MongoDB
      data = await AdminRoles.find({role_id: roleId});
    } else { //MySQL
      data = await AdminRoles.findAll({where: {role_id: roleId}});
    }

    if (data.length !== 0) {
      throw errors.frontend.AlreadyUsedRoleID();
    }

    if (isMongoDB(AdminRoles)) { // MongoDB
      await AdminRoles.insertMany(list);
    } else { //MySQL
      await AdminRoles.bulkCreate(list);
    }

    return res.json({role_id: roleId, paths: paths});
  });
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

  return asyncWrapper(async (req, res) => {
    const roleId = req.swagger.params.role_id.value;

    let list;
    if (isMongoDB(AdminRoles)) { // MongoDB
      list = await AdminRoles.find({role_id: roleId});
    } else { //MySQL
      list = await AdminRoles.findAll({where: {role_id: roleId}});
    }

    let paths;
    if (req.swagger.operation.responses[200].schema.properties.paths.type === 'array') {
      // paths: [{"allow":true, "path":"GET:/users"}] パターン
      paths = list.map(role => {
        return {allow: true, path: `${role.method}:/${role.resource}`};
      });
    } else {
      // paths: {"GET:/users": true} パターン
      paths = reduce(list, (obj, role) => {
        obj[`${role.method}:/${role.resource}`] = true;
        return obj;
      }, {});
    }
    return res.json({paths: paths, role_id: roleId});
  });
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
  return asyncWrapper(async (req, res) => {
    const roleId = req.swagger.params.role_id.value;

    let list;
    if (isMongoDB(AdminUsers)) { // MongoDB
      list = await AdminUsers.find({role_id: roleId});
    } else { //MySQL
      list = await AdminUsers.findAll({where: {role_id: roleId}});
    }


    // 削除対象の権限を持っているユーザがいたら、エラーを返す。
    if (list.length !== 0) {
      throw errors.frontend.CurrentlyUsedAdminRole();
    }

    if (isMongoDB(AdminRoles)) { // MongoDB
      await AdminRoles.deleteMany({role_id: roleId});
    } else { //MySQL
      await AdminRoles.destroy({where: {role_id: roleId}, force: true});
    }

    return res.status(204).end();
  });
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

  return asyncWrapper(async (req, res) => {
    const roleId = req.swagger.params.role_id.value;
    const paths = req.body.paths;
    const list = genAdminRole(roleId, paths);

    if (isMongoDB(AdminRoles)) { // MongoDB
      // TODO: transaction not support!
      await AdminRoles.deleteMany({role_id: roleId});
      await AdminRoles.insertMany(list);
      return res.json({role_id: roleId, paths: paths});

    } else { // MySQL
      const t = await store.transaction();
      try {
        await AdminRoles.destroy({where: {role_id: roleId}, force: true, transaction: t});
        await AdminRoles.bulkCreate(list, {transaction: t});
        await t.commit();
      } catch (err) {
        logger.error(err);
        await t.rollback();
        throw err;
      }

      return res.json({role_id: roleId, paths: paths});
    }
  });
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
