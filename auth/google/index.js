const helper = require('./helper');
const middleware = require('./middleware');

module.exports = () => {
  return {
    helper: helper,
    middleware: middleware,
  };
};
