const middleware = require('./middleware');

module.exports = options => {
  return {
    middleware: opts => middleware(opts || options),
  };
};
