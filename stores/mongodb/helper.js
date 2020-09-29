const isEmpty = require('mout/lang/isEmpty');
const isFinite = require('mout/lang/isFinite');
const bson = require('bson');
const constants = require('../../constants');

/**
 * find
 * @param {Mongoose.Model} Model
 * @param {Object} conditions - {name: "a"}
 * @param {Object} projection - ['id', 'name', 'age']
 * @param {Object} options - {limit: 1, offset: 0, sort: {createdAt: 'desc'}}
 */
const find = (Model, conditions = {}, projection = {}, options = {}) => {
  const opts = Object.assign({}, options);
  if (!isFinite(options.limit)) {
    opts.limit = constants.DEFAULT_PAGER_LIMIT;
  }
  if (!isFinite(options.skip)) {
    opts.skip = 0;
  }
  if (isEmpty(options.sort)) {
    opts.sort = {
      createdAt: 'desc'
    };
  }
  return Model.find(conditions, projection, opts).exec();
};

/**
 * findAll
 * @param {Mongoose.Model} Model
 * @param {Object} conditions - {name: "a"}
 * @param {Object} projection - ['id', 'name', 'age']
 * @param {Object} options - {sort: {createdAt: 'desc'}}
 */
const findAll = (Model, conditions = {}, projection = {}, options = {}) => {
  const opts = Object.assign({}, options);
  if (isEmpty(options.sort)) {
    opts.sort = {
      createdAt: 'desc'
    };
  }
  return Model.find(conditions, projection, opts).exec();
};

/**
 * findOne
 * @param {Mongoose.Model} Model
 * @param {Object} conditions 検索条件
 * @param {Object} projection 結果データフィルタ
 * @param {Object} options Mongooseオプション
 */
const findOne = (Model, conditions, projection = {}, options = {}) => {
  return Model.findOne(conditions, projection, options);
};

/**
 * count
 * @param {Mongoose.Model} Model
 * @param {Object} conditions 検索条件
 */
const count = (Model, conditions = {}) => {
  return Model.countDocuments(conditions);
};

/**
 * create
 * @param {Mongoose.Model} Model
 * @param {Object} doc 保存するデータ
 */
const create = (Model, doc) => {
  return new Model(doc).save();
};

/**
 * create many
 * @param {Mongoose.Model} Model
 * @param {Array<Object>} docs 保存するデータ
 * @param {Object} options Mongooseオプション
 */
const createMany = (Model, docs, options) => {
  return Model.insertMany(docs, options);
};

/**
 * remove
 * @param {Mongoose.Model} Model
 * @param {Object} conditions 検索条件
 */
const remove = (Model, conditions) => {
  return Model.remove(conditions);
};

/**
 * remove
 * @param {Mongoose.Model} model
 * @param {Object} conditions 検索条件
 * @param {*} options Mongooseオプション
 */
const removeOne = (Model, conditions, options = {}) => {
  return Model.findOneAndRemove(conditions, options);
};

/**
 * update
 * @param {Mongoose.Model} model
 * @param {*} query 検索条件
 * @param {*} doc 保存するデータ
 * @param {*} options Mongooseオプション
 */
const updateOne = (Model, query, doc, options = {true: false}) => {
  return Model.findOneAndUpdate(query, doc, options);
};

/**
 * update many
 * @param {Mongoose.Model} Model
 * @param {*} query 検索条件
 * @param {*} doc 保存するデータ
 * @param {*} options Mongooseオプション
 */
const updateMany = (Model, query, doc, options = {}) => {
  return Model.updateMany(query, doc, options);
};

/**
 *
 * @param {Mongoose.Model} model
 * @param {Object} conditions 検索条件
 * @param {*} projection 結果データフィルタ
 * @param {*} options Mongooseオプション
 */
const findWithCount = async (
  Model,
  conditions = {},
  projection = {},
  options = {}
) => {
  const [list, totalCount] = await Promise.all([
    find(Model, conditions, projection, options),
    count(Model, conditions)
  ]);

  return {
    list: list.map(obj => obj.toJSON()),
    count: totalCount,
  };
};

/**
 * MongoDB#ObjectIDかどうか
 * @param {*} s チェック対応データ
 */
const isObjectId = s => {
  return bson.ObjectId.isValid(s);
};


module.exports = {
  find,
  findAll,
  findOne,
  count,
  create,
  createMany,
  remove,
  removeOne,
  updateOne,
  updateMany,
  findWithCount,
  isObjectId
};
