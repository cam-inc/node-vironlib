/**
 * Middleware : Set Swagger Object
 *
 * @param {Object} pipes - bagpipes
 * @returns {function(*, *, *)}
 */
module.exports = pipes => {
  return (req, res, next) => {
    if (!req.swagger.swaggerObject) {
      req.swagger.swaggerObject = pipes.config.swaggerNodeRunner.swagger;
    }
    next();
  };
};
