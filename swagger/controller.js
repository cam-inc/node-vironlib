const {createHmac} = require('crypto');

const asyncWrapper = require('../async_wrapper');
const {isMongoDB}= require('../helper');
const deepClone = require('mout/lang/deepClone');
const {find, has, merge, set} = require('mout/object');
const {isEmpty, isArray, isPlainObject} = require('mout/lang');

const helperAdminRole = require('../admin_role/helper');
const logger = require('../logger');

const genHash = (prefix, def) => {
  const hmac = createHmac('sha256', 'cache');
  hmac.update(prefix);
  hmac.update(JSON.stringify(def));
  return hmac.digest('hex');
};

const genEnum = async (def, store, cache) => {
  const defEnum = def['x-autogen-enum'];
  const field = defEnum.field;
  const hashKey = genHash('enum', defEnum);

  let Model;
  let list;
  if (has(cache, hashKey)) { // cache
    list = cache[defEnum.model][field];
  } else if (isMongoDB(store)) { // MongoDB
    Model = find(store.models, mdl => mdl.modelName === defEnum.model);
    if (!defEnum.order) {
      logger.warn('generate enum order not support.');
    }
    if (!defEnum.where) {
      logger.warn('generate enum where not support.');
    }
    list = await Model.find({}, {[field]: 1});
    set(cache, `${defEnum.model}.${field}`, list);

  } else { // MySQL
    Model = find(store.models, mdl => mdl.tableName === defEnum.model);
    const options = {attributes: [field]};
    if (defEnum.order) {
      options.order = defEnum.order;
    }
    if (defEnum.where) {
      options.where = defEnum.where;
    }
    list = await Model.findAll(options);
    set(cache, `${defEnum.model}.${field}`, list);

  }

  const enums = new Set(defEnum.defaults);
  list.forEach(rec => enums.add(rec[field]));
  return Array.from(enums);
};

const genCheckList = async (def, store, cache) => {
  const defCheckList = def['x-autogen-checklist'];
  const Model = find(store.models, mdl => mdl.tableName === defCheckList.model);
  const hashKey = genHash('checklist', defCheckList);
  const field = defCheckList.field;
  let list;
  if (has(cache, hashKey)) {
    list = cache[defCheckList.model][field];
  } else {
    const options = {attributes: [field]};
    if (defCheckList.order) {
      options.order = defCheckList.order;
    }
    if (defCheckList.where) {
      options.where = defCheckList.where;
    }
    list = await Model.findAll(options);
    set(cache, `${defCheckList.model}.${field}`, list);
  }
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
  return map;
};

const transform = async (def, store, cache) => {
  if (!def) {
    return def;
  }

  if (def.type === 'object' && def.properties) {
    const tasks = Object.keys(def.properties).map(key => {
      return transform(def.properties[key], store, cache)
        .then(_def => {
          return {[key]: _def};
        });
    });
    if (tasks.length) {
      def.properties = await Promise.all(tasks)
        .then(results => merge(...results));
    }
  } else if (def.type === 'array' && def.items) {
    def.items = await transform(def.items, store, cache);
    const tasks = Object.keys(def.items).map(key => {
      return transform(def.items[key], store, cache)
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
      return transform(def[key], store, cache)
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
      return transform(d, store, cache);
    });
    if (tasks.length) {
      def = await Promise.all(tasks);
    }
  }
  if (def['x-autogen-enum']) {
    def.enum = await genEnum(def, store, cache);
  }
  if (def['x-autogen-checklist']) {
    def.properties = await genCheckList(def, store, cache);
    def.type = def.type || 'object';
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

  return asyncWrapper(async (req, res) => {
    if (req.swagger.swaggerObject.definitions) {
      // definitionsの動的変換を行う
      const cache = {};
      const tasks = Object.keys(req.swagger.swaggerObject.definitions).map(key => {
        return transform(req.swagger.swaggerObject.definitions[key], options.store, cache)
          .then(result => {
            return {[key]: result};
          });
      });
      await Promise.all(tasks).then(results => merge(...results));
    }

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
  });
};

module.exports = options => {
  return {
    show: registerShow(options),
  };
};
