const util = require('util');
const logger = require('./logger');

module.exports = () => {
  /**
   * Error Handler
   */
  return (context, next) => {
    const err = context.error;
    if (!util.isError(err)) {
      // エラーじゃなければ無視
      return next();
    }

    // 常にjson
    context.headers['Content-Type'] = 'application/json';

    const req = context.request;
    const errorResponse = {
      error: err,
      request_headers: req.headers,
    };
    // when NODE_ENV is not production, add debug information
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.debug = {
        stack: err.stack && err.stack.split('\n'),
        name: err.name,
        message: err.message,
      };
    }

    // ステータスコードをcontextに反映
    if (!context.statusCode || context.statusCode < 400) {
      if (context.response && context.response.statusCode && context.response.statusCode >= 400) {
        context.statusCode = context.response.statusCode;
      } else if (err.statusCode && err.statusCode >= 400) {
        context.statusCode = err.statusCode;
        delete err.statusCode;
      } else {
        context.statusCode = 500;
      }
    }

    logger.error(util.inspect(errorResponse));
    delete context.error; // これをしないとjsonで返せない
    next(null, JSON.stringify(errorResponse));
  };
};
