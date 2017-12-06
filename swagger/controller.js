const deepClone = require('mout/lang/deepClone');
const {find, has, merge} = require('mout/object');
const isEmpty = require('mout/lang/isEmpty');

const helperAdminRole = require('../admin_role/helper');

const genEnum = async (def, store) => {
  const defEnum = def['x-autogen-enum'];
  const Model = find(store.models, mdl => mdl.tableName === defEnum.model);
  const field = defEnum.field;
  const list = await Model.findAll();
  const enums = new Set(defEnum.defaults);
  list.forEach(rec => enums.add(rec[field]));
  return Array.from(enums);
};

const traverse = async (def, store) => {
  if (!def) {
    return def;
  }

  if (def.type === 'object' && def.properties) {
    const tasks = Object.keys(def.properties).map(key => {
      return traverse(def.properties[key], store)
        .then(_def => {
          return {[key]: _def};
        });
    });
    def.properties = await Promise.all(tasks)
      .then(results => {
        return merge(...results);
      })
    ;
  }
  if (def.type === 'array' && def.items) {
    const tasks = Object.keys(def.items).map(key => {
      return traverse(def.items[key], store)
        .then(_def => {
          return {[key]: _def};
        });
    });
    def.items = await Promise.all(tasks)
      .then(results => {
        return merge(...results);
      })
    ;
  }
  if (def['x-autogen-enum']) {
    def.enum = await genEnum(def, store);
  }
  return def;
};

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
    const swaggerObject = deepClone(req.swagger.swaggerObject);

    return Promise.resolve()
      .then(() => {
        if (!swaggerObject.definitions) {
          return;
        }
        const tasks = Object.keys(swaggerObject.definitions).map(key => {
          return traverse(swaggerObject.definitions[key], options.store)
            .then(result => {
              return {[key]: result};
            });
        });
        return Promise.all(tasks).then(results => merge(...results));
      })
      .then(() => {
        if (options.host) {
          swaggerObject.host = options.host;
        }
        if (!req.swagger.operation.security) {
          // swagger.json自体が非認証の場合はそのまま返す
          return res.json(swaggerObject);
        }

        // 権限がないパスをswagger.jsonから消して返す
        const roles = req.auth.roles;
        for (let path in swaggerObject.paths) {
          for (let m in swaggerObject.paths[path]) {
            if (!helperAdminRole.canAccess(path, m, roles)) {
              // 権限がないパスをswaggerから削除
              delete swaggerObject.paths[path][m];
            }
          }
          if (isEmpty(swaggerObject.paths[path])) {
            // pathが空になった場合はキー自体を削除
            delete swaggerObject.paths[path];
          }
        }
        return res.json(swaggerObject);
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
