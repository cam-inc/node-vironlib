const reject = require('mout/array/reject');

/**
 * Wrapper of default swagger_validator
 * @see swagger-node-runner/fittings/swagger_validator.js
 */
module.exports = (fittingDef, pipes) => {
  const validatorConfig = {
    validateResponse: !!fittingDef.validateResponse
  };
  const middleware = pipes.config.swaggerNodeRunner.swaggerTools.swaggerValidator(validatorConfig);

  return (context, next) => {
    middleware(context.request, context.response, err => {
      if (!err || !err.failedValidation) {
        // validationエラー以外はスルー
        return next(err);
      }
      // type: null 以外のフィールドでもnull値を許容する
      const newErrors = reject(err.results.errors, err => {
        return err.message.match(/^Expected type [\w.]+ but found type null$/);
      });
      if (newErrors.length) {
        err.results.errors = newErrors;
        return next(err);
      }
      context.response.statusCode = 200;
      next();
    });
  };
};
