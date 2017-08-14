module.exports = logger => {
  logger = logger || {
    debug: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    fatal: console.error,
  };
  module.exports = logger;
  return logger;
};
