const deepClone = require('mout/lang/deepClone');
const {find, has, merge} = require('mout/object');
const {isEmpty, isArray, isPlainObject} = require('mout/lang');

const helperAdminRole = require('../admin_role/helper');

const genEnum = async (def, store) => {
  const defEnum = def['x-autogen-enum'];
  const Model = find(store.models, mdl => mdl.tableName === defEnum.model);
  const field = defEnum.field;
  const list = await Model.findAll({attributes: [field]});
  const enums = new Set(defEnum.defaults);
  list.forEach(rec => enums.add(rec[field]));
  return Array.from(enums);
};

const genCheckList = async (def, store) => {
  const defCheckList = def['x-autogen-checklist'];
  const Model = find(store.models, mdl => mdl.tableName === defCheckList.model);
  const field = defCheckList.field;
  const list = await Model.findAll({attributes: [field]});
  const map = {};
  list.forEach(rec => {
    const val = rec[field];
    map[val] = {
      type: 'boolean',
      default: defCheckList.default,
    };
  });
  if (defCheckList.defaults) {
    defCheckList.defaults.forEach(val => {
      map[val] = {
        type: 'boolean',
        default: defCheckList.default,
      };
    });
  }
  return {
    type: 'object',
    properties: map,
  };
};

const transform = async (def, store) => {
  if (!def) {
    return def;
  }

  if (def.type === 'object' && def.properties) {
    const tasks = Object.keys(def.properties).map(key => {
      return transform(def.properties[key], store)
        .then(_def => {
          return {[key]: _def};
        });
    });
    if (tasks.length) {
      def.properties = await Promise.all(tasks)
        .then(results => merge(...results));
    }
  } else if (def.type === 'array' && def.items) {
    const tasks = Object.keys(def.items).map(key => {
      return transform(def.items[key], store)
        .then(_def => {
          return {[key]: _def};
        });
    });
    if (tasks.length) {
      def.items = await Promise.all(tasks)
        .then(results => merge(...results));
    }
  } else if (isPlainObject(def)) {
    const tasks = Object.keys(def).map(key => {
      return transform(def[key], store)
        .then(_def => {
          return {[key]: _def};
        });
    });
    if (tasks.length) {
      def = await Promise.all(tasks)
        .then(results => merge(...results));
    }
  } else if (isArray(def)) {
    const tasks = def.map(d => {
      return transform(d, store);
    });
    if (tasks.length) {
      def = await Promise.all(tasks);
    }
  }
  if (def['x-autogen-enum']) {
    def.enum = await genEnum(def, store);
  }
  if (def['x-autogen-checklist']) {
    def = await genCheckList(def, store);
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
    return Promise.resolve()
      .then(() => {
        if (!req.swagger.swaggerObject.definitions) {
          return;
        }
        const tasks = Object.keys(req.swagger.swaggerObject.definitions).map(key => {
          return transform(req.swagger.swaggerObject.definitions[key], options.store)
            .then(result => {
              return {[key]: result};
            });
        });
        return Promise.all(tasks).then(results => merge(...results));
      })
      .then(() => {
        if (options.host) {
          req.swagger.swaggerObject.host = options.host;
        }
        if (!req.swagger.operation.security) {
          // swagger.json自体が非認証の場合はそのまま返す
          return res.json(req.swagger.swaggerObject);
        }

        // 権限がないパスをswagger.jsonから消して返す
        const swaggerObject = deepClone(req.swagger.swaggerObject);
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
