const contains = require('mout/array/contains');
const has = require('mout/object/has');

/**
 * Middleware : completion body
 *
 * @param {Object} options
 * @param {Array} options.paths
 * @returns {function(*, *, *)}
 */
module.exports = options => {
  const excludePaths = options.exclude_paths;
  return (req, res, next) => {
    if ((req.method !== 'PUT' && req.method !== 'POST') || contains(excludePaths, req.path)) {
      return next();
    }
    req.swagger.operation.parameters.forEach(parameter => {
      if (parameter.in === 'body') {
        Object.keys(parameter.schema.properties).forEach(key => {
          if (req.body[key] === undefined) {
            const def = parameter.schema.properties[key];
            if (has(def, 'x-completion-value')) {
              req.body[key] = def['x-completion-value'];
            } else {
              req.body[key] = null;
            }
          }
        });
      }
    });
    next();
  };
};
