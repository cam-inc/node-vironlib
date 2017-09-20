const controller = require('./controller');

module.exports = options => {
  return {
    controller: controller(options),
  };
};
