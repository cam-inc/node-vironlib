const helper = require('./helper');
const middleware = require('./middleware');

module.exports = options => {
  return {
    helper: helper,
    middleware: () => middleware(options),
  };
};
