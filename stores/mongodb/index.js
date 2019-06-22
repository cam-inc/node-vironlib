const models = require('./models');
const helper = require('./helper');

const initModels = mongoose => {
  Object.keys(models).forEach(k => {
    if (typeof models[k] !== 'function') {
      return;
    }
    const {name, schema} = models[k](mongoose.base);
    mongoose.model(name, schema);
  });
  return mongoose;
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
    return initModels(mongoose);
  }
};
