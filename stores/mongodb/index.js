const models = require('./models');
const helper = require('./helper');

const initModels = async mongoose => {
  const tasks = Object.keys(models).map(k => {
    if (typeof models[k] !== 'function') {
      return Promise.resolve();
    }
    const { name, schema } = models[k](mongoose.base);
    mongoose.model(name, schema);
  });
  return await Promise.all(tasks).then(() => mongoose);
};

module.exports = {
  /**
   * Model Define
   */
  models: models,

  /**
   * Helper functions
   */
  helper: helper,

  /**
   * 初期化
   * @param mongoose Mongoose instance
   */
  init: async mongoose => {
    return await initModels(mongoose);
  }
};
