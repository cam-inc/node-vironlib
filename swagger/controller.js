const deepClone = require('mout/lang/deepClone');
const get = require('mout/object/get');
const filter = require('mout/array/filter');
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
        AdminRoles.findAll()
          .then(list => {
            const def = req.swagger.swaggerObject.definitions.UpdateAdminUserPayload;
            if (def) {
              // swagger書き換え
              const enums = new Set(options.super_role && [options.super_role]);
              list.forEach(role => {
                enums.add(role.dataValues.role_id);
              });
              def.properties.role_id.enum = Array.from(enums);
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
                // x-refからも削除
                const xRef = get(swagger.paths, `${path}.${m}.x-ref`);
                if (xRef) {
                  const newXRef = filter(xRef, ref => {
                    return helperAdminRole.canAccess(ref.path, ref.method, roles);
                  });
                  if (isEmpty(newXRef)) {
                    delete swagger.paths[path][m]['x-ref'];
                  } else {
                    swagger.paths[path][m]['x-ref'] = newXRef;
                  }
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
