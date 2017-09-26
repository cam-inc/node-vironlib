const deepClone = require('mout/lang/deepClone');
const isEmpty = require('mout/lang/isEmpty');

const helperAdminRole = require('../admin_role/helper');

/**
 * Controller : swagger.json
 * HTTP Method : GET
 * PATH : /swagger.json
 *
 * @returns {function(*, *, *)}
 */
const registerShow = options => {
  options = options || {};

  return (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        if (options.host) {
          req.swagger.swaggerObject.host = options.host;
        }
        if (!req.swagger.operation.security) {
          // swagger.json自体が非認証の場合はそのまま返す
          return res.json(req.swagger.swaggerObject);
        }
        const AdminRoles = options.admin_roles;
        return AdminRoles.findAll()
          .then(list => {
            // RoleIDのenumを生成し、swaggerにセットする
            const enums = new Set(options.super_role && [options.super_role]);
            list.forEach(role => {
              enums.add(role.dataValues.role_id);
            });
            const enumArray = Array.from(enums);
            const updateAdminUserPayload = req.swagger.swaggerObject.definitions.UpdateAdminUserPayload;
            if (updateAdminUserPayload) {
              if (isEmpty(enumArray)) {
                // enumが0件だとswaggerのvalidation errorになるので削除する
                delete updateAdminUserPayload.properties.role_id.enum;
              } else {
                updateAdminUserPayload.properties.role_id.enum = enumArray;
              }
            }
            const createAdminUserPayload = req.swagger.swaggerObject.definitions.CreateAdminUserPayload;
            if (createAdminUserPayload) {
              if (isEmpty(enumArray)) {
                // enumが0件だとswaggerのvalidation errorになるので削除する
                delete createAdminUserPayload.properties.role_id.enum;
              } else {
                createAdminUserPayload.properties.role_id.enum = enumArray;
              }
            }

            // 権限がないパスをswagger.jsonから消して返す
            const swagger = deepClone(req.swagger.swaggerObject);
            const roles = req.auth.roles;
            for (let path in swagger.paths) {
              for (let m in swagger.paths[path]) {
                if (!helperAdminRole.canAccess(path, m, roles)) {
                  // 権限がないパスをswaggerから削除
                  delete swagger.paths[path][m];
                }
              }
              if (isEmpty(swagger.paths[path])) {
                // pathが空になった場合はキー自体を削除
                delete swagger.paths[path];
              }
            }
            return res.json(swagger);
          })
        ;
      })
      .catch(next)
    ;
  };
};

module.exports = options => {
  return {
    show: registerShow(options),
  };
};
