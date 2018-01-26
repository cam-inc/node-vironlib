const models = require('./models');
const helper = require('./helper');

const initModel = model => {
  return new Promise((resolve, reject) => {
    if (!model.sync) {
      return resolve();
    }
    model
      .sync()
      .then(resolve)
      .catch(reject)
    ;
  });
};

const initModels = async sequelize => {
  const tasks = Object.keys(models).map(name => {
    if (typeof models[name] !== 'function') {
      return Promise.resolve();
    }
    return initModel(models[name](sequelize));
  });
  return await Promise.all(tasks).then(() => sequelize);
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
   * @param sequelize Sequelize instance
   */
  init: async sequelize => {
    return await initModels(sequelize);
  },

};
