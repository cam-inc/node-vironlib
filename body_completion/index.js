const middleware = require('./middleware');

module.exports = options => {
  return {
    middleware: () => middleware(options),
  };
};
