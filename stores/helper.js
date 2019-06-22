/**
 * MySQL only support!!!
 * @deprecated このヘルパーは、非推奨APIです。
 */
/**
 * create
 * @param {Object} store
 * @param {*} model
 * @param {Object} data
 */
const create = (store, ...args) => {
  return store.helper.create(...args);
};

/**
 * list
 * @param {Object} store
 * @param {*} model
 * @param {Object} query - {name: 'AAA'}
 * @param {Object} options
 * @param {Array} options.attributes - ['id', 'name', 'age']
 * @param {number} options.limit
 * @param {number} options.offset
 * @param {Array} options.order - [['name', 'DESC']]
 */
const list = async (store, ...args) => {
  const results = await Promise.all([
    store.helper.find(...args),
    store.helper.count(...args)
  ]);
  return { list: results[0], count: results[1] };
};

/**
 * remove
 * @param {Object} store
 * @param {*} model
 * @param {Object} query - {name: 'AAA'}
 * @param {Object} options
 */
const remove = (store, ...args) => {
  return store.helper.remove(...args);
};

/**
 * get
 * @param {Object} store
 * @param {*} model
 * @param {Object} query - {name: 'AAA'}
 * @param {Object} options
 * @param {Array} options.attributes - ['id', 'name', 'age']
 */
const findOne = (store, ...args) => {
  return store.helper.findOne(...args);
};

/**
 * update
 * @param {Object} store
 * @param {*} model
 * @param {Object} query - {name: 'AAA'}
 * @param {Object} data
 * @param {Object} options
 */
const update = (store, ...args) => {
  return store.helper.update(...args);
};

module.exports = {
  list,
  findOne,
  create,
  remove,
  update
};
