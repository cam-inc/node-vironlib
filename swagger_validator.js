const get = require('mout/object/get');
const {isFunction, isArray, isEmpty} = require('mout/lang');
const reject = require('mout/array/reject');

/**
 * Wrapper of default swagger_validator
 * @see swagger-node-runner/fittings/swagger_validator.js
 */
module.exports = (fittingDef, pipes) => {
  const fn = get(pipes, 'config.swaggerNodeRunner.swaggerTools.swaggerValidator');
  let middleware;
  if (isFunction(fn)) {
    // swagger-express-mw@0.1.0
    const validatorConfig = {
      validateResponse: !!fittingDef.validateResponse
    };
    middleware = fn(validatorConfig);
  } else {
    // swagger-express-mw@0.7.0
    middleware = (req, res, next) => {
      if (!req.swagger.operation) {
        return next();
      }

      const validateResult = req.swagger.operation.validateRequest(req);
      if (!validateResult.errors.length) {
        return next();
      }

      next({
        failedValidation: true,
        results: validateResult.errors,
      });
    };
  }

  return (context, next) => {
    middleware(context.request, context.response, err => {
      if (!err || !err.failedValidation) {
        // validationエラー以外はスルー
        return next(err);
      }
      const results = isArray(err.results) ? err.results : [err.results];
      const newErrors = reject(results, result => {
        return isEmpty(reject(result.errors, err => {
          return err.code === 'ENUM_MISMATCH' || // 動的生成部分のvalidateができないので無視する
            err.message.match(/^Expected type [\w.]+ but found type null$/); // type: null 以外のフィールドでもnull値を許容する
        }));
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
