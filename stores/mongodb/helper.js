const isEmpty = require('mout/lang/isEmpty');
const isFinite = require('mout/lang/isFinite');

const constants = require('../../constants');

/**
 * find
 * @param {Mongoose.Model} model
 * @param {Object} query - {name: "a"}
 * @param {Object} options
 * @param {Array} options.attributes - ['id', 'name', 'age']
 * @param {Number} options.limit - 100
 * @param {Number} options.offset - 10
 * @param {Array} options.order - [['id', 'ASC'], ['name', 'DESC']]
 */
const find = (model, query, options={}) => {
  // const opts = Object.assign({}, options);
  // if (!isEmpty(query)) {
  //   opts.where = query;
  // }
  // if (!isFinite(options.limit)) {
  //   opts.limit = constants.DEFAULT_PAGER_LIMIT;
  // }
  // if (!isFinite(options.offset)) {
  //   opts.offset = 0;
  // }
  // return model.findAll(opts);
};

/**
 * findOne
 * @param {Mongoose.Model} model
 * @param {Object} query - {id: 1}
 * @param {Object} options
 * @param {Array} options.attributes - ['id', 'name', 'age']
 */
const findOne = (model, query, options={}) => {
  // const opts = Object.assign({}, options);
  // if (!isEmpty(query)) {
  //   opts.where = query;
  // }
  // return model.findOne(opts);
};

/**
 * count
 * @param {Mongoose.Model} model
 * @param {Object} query - {name: 'AAA'}
 * @param {Object} options
 */
const count = (model, query, options={}) => {
  // const opts = Object.assign({}, options);
  // if (!isEmpty(query)) {
  //   opts.where = query;
  // }
  // delete opts.attributes;
  // return model.count(opts);
};

/**
 * create
 * @param {Mongoose.Model} model
 * @param {Object} data
 */
const create = (model, data) => {
  return model.create(data);
};

/**
 * remove
 * @param {Mongoose.Model} model
 * @param {Object} query - {name: 'AAA'}
 * @param {Object} options
 * @param {boolean} options.force
 */
const remove = (model, query, options={}) => {
  // const opts = Object.assign({}, options);
  // if (!isEmpty(query)) {
  //   opts.where = query;
  // }
  // return model.destroy(opts);
};

/**
 * update
 * @param {Mongoose.Model} model
 * @param {Object} query - {name: 'AAA'}
 * @param {Object} data
 * @param {Object} options
 */
const update = (model, query, data, options={}) => {
  // const opts = Object.assign({}, options);
  // if (!isEmpty(query)) {
  //   opts.where = query;
  // }
  // return model.update(data, opts);
};

module.exports = {
  find,
  findOne,
  count,
  create,
  remove,
  update,
};
