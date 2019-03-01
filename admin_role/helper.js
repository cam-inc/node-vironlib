const {contains} = require('mout/array');
const {reduce} = require('mout/object');

const {isMongoDB} = require('../helper');

// 常にアクセスOKなリソース
const whiteList = [
  'viron',
  'swagger.json',
  'viron_authtype',
  'signin',
  'signout',
  'googlesignin',
  'googleoauth2callback',
  'ping',
];

/**
 * パスに対してアクセス権があるかチェックする
 * @param {string} path
 * @param {string} method
 * @param {object} roles - {get: [], post: [], put: [], delete: []}
 */
const canAccess = (path, method, roles) => {
  method = method.toLowerCase();
  const resource = path.split('/')[1];
  const _roles = roles[method] || [];
  return !resource || contains(whiteList, resource) || contains(_roles, '*') || contains(_roles, resource);
};

/**
 * roleIdが持っている権限の一覧を取得する
 * @param {Sequelize.Model} AdminRoles
 * @param {String} roleId
 * @param {String} superRole
 */
const getRoles = async (AdminRoles, roleId, superRole) => {
  if (roleId === superRole) {
    return {
      get: ['*'],
      post: ['*'],
      put: ['*'],
      delete: ['*'],
      patch: ['*'],
    };
  }

  let roles;
  if (isMongoDB(AdminRoles)) {
    roles = await AdminRoles.find({role_id: roleId});
  } else {
    roles = await AdminRoles.findAll({where: {role_id: roleId}});
  }

  return reduce(roles, (ret, role) => {
    const method = role.method.toLowerCase();
    ret[method] = ret[method] || [];
    ret[method].push(role.resource);
    return ret;
  }, {});
};

module.exports = {
  canAccess,
  getRoles,
  whiteList,
};
