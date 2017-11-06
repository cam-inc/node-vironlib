const controller = require('./controller');
const helper = require('./helper');
const middleware = require('./middleware');

module.exports = options => {
  return {
    controller: controller(options),
    helper: helper,
    middleware: pipes => middleware(pipes),
  };
};
