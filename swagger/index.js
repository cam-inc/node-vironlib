const controller = require('./controller');
const helper = require('./helper');

module.exports = options => {
  return {
    controller: controller(options),
    helper: helper,
  };
};
