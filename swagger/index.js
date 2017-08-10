const controller = require('./controller');
const helper = require('./helper');

module.exports = () => {
  return {
    controller: controller(),
    helper: helper,
  };
};
