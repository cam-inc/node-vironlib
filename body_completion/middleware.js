const contains = require('mout/array/contains');
/**
 * Middleware : completion body
 *
 * @param {Object} options
 * @param {Array} options.paths
 * @returns {function(*, *, *)}
 */
module.exports = options => {
  const excludePaths = options.excludePaths;
  return (req, res, next) => {
    if ((req.method !== 'PUT' && req.method !== 'POST') || contains(excludePaths, req.path)) {
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