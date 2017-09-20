const clone = require('mout/lang/clone');
const find = require('mout/object/find');
const logger = require('../logger');

/**
 * Controller : Autocomplete
 * HTTP Method : GET
 * PATH : /viron_autocomplete
 *
 * @param {Object} options
 * @param {Sequelize} options.store
 * @param {Object} pager
 * @returns {function(*, *, *)}
 */
const registerList = options => {
  const models = options.store && options.store.models || {};
  const limit = 100;

  return (req, res, next) => {
    const query = clone(req.query);
    const model = query.model;
    const disp = query.disp;
    if (!model) {
      logger.warn('[VIRONLIB] autocomplete query.model is required.');
      return res.json([]);
    }

    const m = find(models, mdl => mdl.tableName === model);
    if (!m) {
      logger.warn(`[VIRONLIB] autocomplete model not exists. ${model}`);
      return res.json([]);
    }

    delete query.model;
    delete query.disp;
    const field = Object.keys(query)[0];
    const attributes = [field];
    if (disp) {
      attributes.push(disp);
    }
    const opts = {
      where: {
        [field]: {$like: `%${query[field]}%`},
      },
      attributes,
      limit,
    };

    return m.findAll(opts)
      .then(list => {
        const result = list.map(data => {
          return {
            name: disp ? data[disp] : data[field],
            value: data[field],
          };
        });
        res.json(result);
      })
      .catch(next)
    ;
  };
};

module.exports = options => {
  return {
    list: registerList(options),
  };
};
