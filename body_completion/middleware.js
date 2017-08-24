const contains = require('mout/array/contains');
/**
 * Middleware : completion body
 *
 * @param {Object} options
 * @param {Array} options.paths
 * @returns {function(*, *, *)}
 */
module.exports = options => {
  const paths = options.paths;
  return (req, res, next) => {
    if (req.method !== 'PUT' || contains(paths, req.path)) {
      return next();
    }
    req.swagger.operation.parameters.forEach(parameter => {
      if (parameter.in === 'body') {
        Object.keys(parameter.schema.properties).forEach(key => {
          if (req.body[key] === undefined) {
            req.body[key] = null;
          }
        });
      }
    });
    next();
  };
};